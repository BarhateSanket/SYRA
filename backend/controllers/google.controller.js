import { getAuthenticatedClient, initializeGoogleClients } from "../config/google.js";

// Helper: Ensure tokens exist before calling Google APIs
const requireGoogleTokens = (req, res) => {
  if (!req.user || !req.user.googleTokens || !req.user.googleTokens.tokens) {
    res.status(401).json({
      success: false,
      error: "Google account not connected"
    });
    return false;
  }
  return true;
};

/* -----------------------------------------------------
   Gmail — Read Emails
----------------------------------------------------- */
export const readEmails = async (req, res) => {
  try {
    if (!requireGoogleTokens(req, res)) return;

    const tokens = req.user.googleTokens.tokens;
    const auth = getAuthenticatedClient(tokens);
    const { gmail } = initializeGoogleClients(auth);

    const inbox = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      q: "is:inbox",
    });

    if (!inbox.data.messages) {
      return res.json({ success: true, emails: [] });
    }

    const emails = await Promise.all(
      inbox.data.messages.map(async ({ id }) => {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id,
        });

        const headers = msg.data.payload.headers;

        return {
          id,
          subject: headers.find((h) => h.name === "Subject")?.value || "",
          from: headers.find((h) => h.name === "From")?.value || "",
          date: headers.find((h) => h.name === "Date")?.value || "",
          snippet: msg.data.snippet,
        };
      })
    );

    res.json({ success: true, emails });
  } catch (error) {
    console.error("Gmail read error:", error);
    res.status(500).json({ success: false, error: "Failed to read emails" });
  }
};

/* -----------------------------------------------------
   Gmail — Send Email
----------------------------------------------------- */
export const sendEmail = async (req, res) => {
  try {
    if (!requireGoogleTokens(req, res)) return;

    const { to, subject, body } = req.body;
    const tokens = req.user.googleTokens.tokens;
    const auth = getAuthenticatedClient(tokens);
    const { gmail } = initializeGoogleClients(auth);

    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "MIME-Version: 1.0",
      "",
      body,
    ].join("\n");

    const encoded = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encoded },
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Gmail send error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
};

/* -----------------------------------------------------
    Google Calendar — List Events
----------------------------------------------------- */
export const getCalendarEvents = async (req, res) => {
  try {
    if (!requireGoogleTokens(req, res)) return;

    const { period, startDate, endDate, maxResults = 10 } = req.query;
    const tokens = req.user.googleTokens.tokens;
    const auth = getAuthenticatedClient(tokens);
    const { calendar } = initializeGoogleClients(auth);

    let timeMin, timeMax;

    if (period) {
      // Use DateParser to handle period-based queries
      const DateParser = (await import('../utils/dateParser.js')).default;
      const periodRange = DateParser.parsePeriod(period, req.user.timezone || 'Asia/Calcutta');
      timeMin = periodRange.startDate;
      timeMax = periodRange.endDate;
    } else if (startDate) {
      timeMin = startDate;
      timeMax = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
    } else {
      timeMin = new Date().toISOString();
    }

    const events = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      maxResults: parseInt(maxResults),
      orderBy: "startTime",
    });

    res.json({
      success: true,
      events: events.data.items || [],
      period: period,
      timeRange: { start: timeMin, end: timeMax }
    });
  } catch (error) {
    console.error("Calendar list error:", error);
    res.status(500).json({ success: false, error: "Failed to get calendar events" });
  }
};

/* -----------------------------------------------------
    Google Calendar — Create Event
----------------------------------------------------- */
export const createCalendarEvent = async (req, res) => {
  try {
    if (!requireGoogleTokens(req, res)) return;

    const { summary, description, startTime, endTime, timeString, checkConflicts = true } = req.body;
    const tokens = req.user.googleTokens.tokens;
    const auth = getAuthenticatedClient(tokens);
    const { calendar } = initializeGoogleClients(auth);

    // Parse natural language time if provided
    let parsedStartTime = startTime;
    let parsedEndTime = endTime;

    if (timeString && !startTime) {
      const DateParser = (await import('../utils/dateParser.js')).default;
      const parsed = DateParser.parseDateTime(timeString, req.user.timezone || 'Asia/Calcutta');

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: `Invalid date/time: ${parsed.error}`
        });
      }

      parsedStartTime = parsed.startDate;
      parsedEndTime = parsed.endDate || new Date(new Date(parsed.startDate).getTime() + 60 * 60 * 1000).toISOString(); // 1 hour default
    }

    // Validate required fields
    if (!summary || !parsedStartTime) {
      return res.status(400).json({
        success: false,
        error: "Event summary and start time are required"
      });
    }

    // Check for scheduling conflicts if requested
    if (checkConflicts) {
      const conflicts = await calendar.events.list({
        calendarId: "primary",
        timeMin: parsedStartTime,
        timeMax: parsedEndTime,
        singleEvents: true,
        maxResults: 5
      });

      if (conflicts.data.items && conflicts.data.items.length > 0) {
        return res.status(409).json({
          success: false,
          error: "Scheduling conflict detected",
          conflicts: conflicts.data.items.map(event => ({
            id: event.id,
            summary: event.summary,
            start: event.start,
            end: event.end
          }))
        });
      }
    }

    const event = {
      summary,
      description: description || '',
      start: { dateTime: parsedStartTime },
      end: { dateTime: parsedEndTime },
      reminders: {
        useDefault: true
      }
    };

    const result = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    res.json({
      success: true,
      event: result.data,
      parsedTime: timeString ? { original: timeString, start: parsedStartTime, end: parsedEndTime } : null
    });
  } catch (error) {
    console.error("Calendar create error:", error);

    // Handle specific Google Calendar API errors
    if (error.code === 400) {
      res.status(400).json({ success: false, error: "Invalid event data" });
    } else if (error.code === 403) {
      res.status(403).json({ success: false, error: "Insufficient calendar permissions" });
    } else {
      res.status(500).json({ success: false, error: "Failed to create event" });
    }
  }
};

/* -----------------------------------------------------
   Google Drive — List Files
----------------------------------------------------- */
export const listDriveFiles = async (req, res) => {
  try {
    if (!requireGoogleTokens(req, res)) return;

    const tokens = req.user.googleTokens.tokens;
    const auth = getAuthenticatedClient(tokens);
    const { drive } = initializeGoogleClients(auth);

    const files = await drive.files.list({
      pageSize: 10,
      fields: "files(id, name, mimeType, modifiedTime)",
    });

    res.json({ success: true, files: files.data.files });
  } catch (error) {
    console.error("Drive list error:", error);
    res.status(500).json({ success: false, error: "Failed to list drive files" });
  }
};

/* -----------------------------------------------------
   Google Photos — Search Photos
----------------------------------------------------- */
export const searchPhotos = async (req, res) => {
  try {
    if (!requireGoogleTokens(req, res)) return;

    const tokens = req.user.googleTokens.tokens;
    const auth = getAuthenticatedClient(tokens);
    const { photos } = initializeGoogleClients(auth);

    const result = await photos.mediaItems.search({
      requestBody: {
        pageSize: 10,
        filters: {
          mediaTypeFilter: { mediaTypes: ["PHOTO"] },
        },
      },
    });

    res.json({ success: true, photos: result.data.mediaItems || [] });
  } catch (error) {
    console.error("Photos search error:", error);
    res.status(500).json({ success: false, error: "Failed to search photos" });
  }
};

/* -----------------------------------------------------
   YouTube — List Playlists
----------------------------------------------------- */
export const getPlaylists = async (req, res) => {
  try {
    if (!requireGoogleTokens(req, res)) return;

    const tokens = req.user.googleTokens.tokens;
    const auth = getAuthenticatedClient(tokens);
    const { youtube } = initializeGoogleClients(auth);

    const playlists = await youtube.playlists.list({
      part: "snippet",
      mine: true,
      maxResults: 10,
    });

    res.json({ success: true, playlists: playlists.data.items });
  } catch (error) {
    console.error("YouTube playlists error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch playlists" });
  }
};

/* -----------------------------------------------------
    Google Calendar — Create Reminder Event
----------------------------------------------------- */
export const createReminderEvent = async (req, res) => {
  try {
    if (!requireGoogleTokens(req, res)) return;

    const { event: eventTitle, timeString, reminderMinutes = 15 } = req.body;
    const tokens = req.user.googleTokens.tokens;
    const auth = getAuthenticatedClient(tokens);
    const { calendar } = initializeGoogleClients(auth);

    // Parse the time for the reminder
    const DateParser = (await import('../utils/dateParser.js')).default;
    const parsed = DateParser.parseDateTime(timeString, req.user.timezone || 'Asia/Calcutta');

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: `Invalid date/time: ${parsed.error}`
      });
    }

    const eventTime = new Date(parsed.startDate);
    const reminderTime = new Date(eventTime.getTime() - (reminderMinutes * 60 * 1000));

    // Create the main event
    const event = {
      summary: `Reminder: ${eventTitle}`,
      description: `Reminder for: ${eventTitle}`,
      start: { dateTime: parsed.startDate },
      end: { dateTime: parsed.endDate || new Date(eventTime.getTime() + 60 * 60 * 1000).toISOString() },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: reminderMinutes },
          { method: 'email', minutes: reminderMinutes }
        ]
      }
    };

    const result = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    res.json({
      success: true,
      event: result.data,
      reminder: {
        eventTitle,
        eventTime: parsed.startDate,
        reminderTime: reminderTime.toISOString(),
        reminderMinutes
      }
    });
  } catch (error) {
    console.error("Calendar reminder create error:", error);

    if (error.code === 400) {
      res.status(400).json({ success: false, error: "Invalid reminder data" });
    } else if (error.code === 403) {
      res.status(403).json({ success: false, error: "Insufficient calendar permissions" });
    } else {
      res.status(500).json({ success: false, error: "Failed to create reminder" });
    }
  }
};

/* -----------------------------------------------------
    YouTube — Subscriptions
----------------------------------------------------- */
export const getSubscriptions = async (req, res) => {
  try {
    if (!requireGoogleTokens(req, res)) return;

    const tokens = req.user.googleTokens.tokens;
    const auth = getAuthenticatedClient(tokens);
    const { youtube } = initializeGoogleClients(auth);

    const subscriptions = await youtube.subscriptions.list({
      part: "snippet",
      mine: true,
      maxResults: 10,
    });

    res.json({ success: true, subscriptions: subscriptions.data.items });
  } catch (error) {
    console.error("YouTube subscriptions error:", error);
    res.status(500).json({ success: false, error: "Failed to get subscriptions" });
  }
};
