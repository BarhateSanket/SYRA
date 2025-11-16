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

    const tokens = req.user.googleTokens.tokens;
    const auth = getAuthenticatedClient(tokens);
    const { calendar } = initializeGoogleClients(auth);

    const events = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    });

    res.json({ success: true, events: events.data.items });
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

    const { summary, description, startTime, endTime } = req.body;
    const tokens = req.user.googleTokens.tokens;

    const auth = getAuthenticatedClient(tokens);
    const { calendar } = initializeGoogleClients(auth);

    const event = {
      summary,
      description,
      start: { dateTime: startTime },
      end: { dateTime: endTime },
    };

    const result = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    res.json({ success: true, event: result.data });
  } catch (error) {
    console.error("Calendar create error:", error);
    res.status(500).json({ success: false, error: "Failed to create event" });
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
