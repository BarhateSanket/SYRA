import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Google OAuth2 client setup
const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
);

// Scopes for different Google services
export const SCOPES = {
    GMAIL: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send'
    ],
    CALENDAR: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ],
    DRIVE: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
    ],
    PHOTOS: [
        'https://www.googleapis.com/auth/photoslibrary.readonly'
    ],
    MAPS: [
        'https://www.googleapis.com/auth/maps.readonly'
    ],
    DOCS: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/presentations'
    ],
    YOUTUBE: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.readonly'
    ]
};

// All scopes combined for full access
export const ALL_SCOPES = [
    ...SCOPES.GMAIL,
    ...SCOPES.CALENDAR,
    ...SCOPES.DRIVE,
    ...SCOPES.PHOTOS,
    ...SCOPES.MAPS,
    ...SCOPES.DOCS,
    ...SCOPES.YOUTUBE
];

// Generate authorization URL
export const getAuthUrl = (scopes = ALL_SCOPES) => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });
};

// Set credentials from authorization code
export const setCredentials = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
};

// Get authenticated client
export const getAuthenticatedClient = (tokens) => {
    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    client.setCredentials(tokens);
    return client;
};

// Initialize Google APIs clients
export const initializeGoogleClients = (auth) => {
    return {
        gmail: google.gmail({ version: 'v1', auth }),
        calendar: google.calendar({ version: 'v3', auth }),
        drive: google.drive({ version: 'v3', auth }),
        photos: google.photoslibrary({ version: 'v1', auth }),
        docs: google.docs({ version: 'v1', auth }),
        sheets: google.sheets({ version: 'v4', auth }),
        slides: google.slides({ version: 'v1', auth }),
        youtube: google.youtube({ version: 'v3', auth })
    };
};

export default oauth2Client;
