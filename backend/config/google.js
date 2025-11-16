import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// Warn if environment variables are missing
if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn("⚠️ Missing GOOGLE_CLIENT_ID");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️ Missing GOOGLE_CLIENT_SECRET");
}

const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "https://syra-jaeg.onrender.com/api/auth/google/callback";

// OAuth2 Client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || "",
  process.env.GOOGLE_CLIENT_SECRET || "",
  REDIRECT_URI
);

// -------------------------------------------
// GOOGLE SCOPES
// -------------------------------------------
export const SCOPES = {
  GMAIL: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
  ],
  CALENDAR: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ],
  DRIVE: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
  ],
  PHOTOS: ["https://www.googleapis.com/auth/photoslibrary.readonly"],
  MAPS: ["https://www.googleapis.com/auth/maps.readonly"],
  DOCS: [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/presentations",
  ],
  YOUTUBE: [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.readonly",
  ],
};

// Combine all scopes
export const ALL_SCOPES = Object.values(SCOPES).flat();

// -------------------------------------------
// AUTH URL (LOGIN URL FOR FRONTEND)
// -------------------------------------------
export const getAuthUrl = (scopes = ALL_SCOPES) => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
};

// -------------------------------------------
// GET TOKENS FROM CODE
// -------------------------------------------
export const setCredentials = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

// -------------------------------------------
// AUTHENTICATED CLIENT (USED IN CONTROLLERS)
// -------------------------------------------
export const getAuthenticatedClient = (tokens) => {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID || "",
    process.env.GOOGLE_CLIENT_SECRET || "",
    REDIRECT_URI
  );

  client.setCredentials(tokens);
  return client;
};

// -------------------------------------------
// INITIALIZE ALL GOOGLE API CLIENTS
// -------------------------------------------
export const initializeGoogleClients = (auth) => {
  return {
    gmail: google.gmail({ version: "v1", auth }),
    calendar: google.calendar({ version: "v3", auth }),
    drive: google.drive({ version: "v3", auth }),
    photos: google.photoslibrary({ version: "v1", auth }), // Correct
    docs: google.docs({ version: "v1", auth }),
    sheets: google.sheets({ version: "v4", auth }),
    slides: google.slides({ version: "v1", auth }),
    youtube: google.youtube({ version: "v3", auth }),
  };
};

export default oauth2Client;
