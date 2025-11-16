import { getAuthenticatedClient, initializeGoogleClients } from '../config/google.js';

// Gmail Integration
export const readEmails = async (req, res) => {
    try {
        const { tokens } = req.user.googleTokens;
        const auth = getAuthenticatedClient(tokens);
        const gmail = initializeGoogleClients(auth).gmail;

        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10,
            q: 'is:inbox'
        });

        const emails = await Promise.all(
            response.data.messages.map(async (message) => {
                const email = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id
                });
                return {
                    id: email.data.id,
                    subject: email.data.payload.headers.find(h => h.name === 'Subject')?.value,
                    from: email.data.payload.headers.find(h => h.name === 'From')?.value,
                    date: email.data.payload.headers.find(h => h.name === 'Date')?.value,
                    snippet: email.data.snippet
                };
            })
        );

        res.json({ success: true, emails });
    } catch (error) {
        console.error('Gmail read error:', error);
        res.status(500).json({ success: false, error: 'Failed to read emails' });
    }
};

export const sendEmail = async (req, res) => {
    try {
        const { to, subject, body } = req.body;
        const { tokens } = req.user.googleTokens;
        const auth = getAuthenticatedClient(tokens);
        const gmail = initializeGoogleClients(auth).gmail;

        const email = [
            'Content-Type: text/plain; charset=utf-8\n',
            'MIME-Version: 1.0\n',
            'Content-Transfer-Encoding: 7bit\n',
            `To: ${to}\n`,
            `Subject: ${subject}\n\n`,
            body
        ].join('');

        const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedEmail
            }
        });

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Gmail send error:', error);
        res.status(500).json({ success: false, error: 'Failed to send email' });
    }
};

// Google Calendar Integration
export const getCalendarEvents = async (req, res) => {
    try {
        const { tokens } = req.user.googleTokens;
        const auth = getAuthenticatedClient(tokens);
        const calendar = initializeGoogleClients(auth).calendar;

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
        });

        res.json({ success: true, events: response.data.items });
    } catch (error) {
        console.error('Calendar events error:', error);
        res.status(500).json({ success: false, error: 'Failed to get calendar events' });
    }
};

export const createCalendarEvent = async (req, res) => {
    try {
        const { summary, description, startTime, endTime } = req.body;
        const { tokens } = req.user.googleTokens;
        const auth = getAuthenticatedClient(tokens);
        const calendar = initializeGoogleClients(auth).calendar;

        const event = {
            summary,
            description,
            start: { dateTime: startTime },
            end: { dateTime: endTime }
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event
        });

        res.json({ success: true, event: response.data });
    } catch (error) {
        console.error('Calendar create event error:', error);
        res.status(500).json({ success: false, error: 'Failed to create calendar event' });
    }
};

// Google Drive Integration
export const listDriveFiles = async (req, res) => {
    try {
        const { tokens } = req.user.googleTokens;
        const auth = getAuthenticatedClient(tokens);
        const drive = initializeGoogleClients(auth).drive;

        const response = await drive.files.list({
            pageSize: 10,
            fields: 'files(id, name, mimeType, modifiedTime)'
        });

        res.json({ success: true, files: response.data.files });
    } catch (error) {
        console.error('Drive list files error:', error);
        res.status(500).json({ success: false, error: 'Failed to list drive files' });
    }
};

// Google Photos Integration
export const searchPhotos = async (req, res) => {
    try {
        const { query } = req.query;
        const { tokens } = req.user.googleTokens;
        const auth = getAuthenticatedClient(tokens);
        const photos = initializeGoogleClients(auth).photos;

        const response = await photos.mediaItems.search({
            requestBody: {
                filters: {
                    contentFilter: {
                        includedContentCategories: ['PEOPLE']
                    },
                    mediaTypeFilter: {
                        mediaTypes: ['PHOTO']
                    }
                },
                pageSize: 10
            }
        });

        res.json({ success: true, photos: response.data.mediaItems });
    } catch (error) {
        console.error('Photos search error:', error);
        res.status(500).json({ success: false, error: 'Failed to search photos' });
    }
};

// YouTube Integration
export const getPlaylists = async (req, res) => {
    try {
        const { tokens } = req.user.googleTokens;
        const auth = getAuthenticatedClient(tokens);
        const youtube = initializeGoogleClients(auth).youtube;

        const response = await youtube.playlists.list({
            part: 'snippet',
            mine: true,
            maxResults: 10
        });

        res.json({ success: true, playlists: response.data.items });
    } catch (error) {
        console.error('YouTube playlists error:', error);
        res.status(500).json({ success: false, error: 'Failed to get playlists' });
    }
};

export const getSubscriptions = async (req, res) => {
    try {
        const { tokens } = req.user.googleTokens;
        const auth = getAuthenticatedClient(tokens);
        const youtube = initializeGoogleClients(auth).youtube;

        const response = await youtube.subscriptions.list({
            part: 'snippet',
            mine: true,
            maxResults: 10
        });

        res.json({ success: true, subscriptions: response.data.items });
    } catch (error) {
        console.error('YouTube subscriptions error:', error);
        res.status(500).json({ success: false, error: 'Failed to get subscriptions' });
    }
};
