import express from 'express';
import {
    readEmails,
    sendEmail,
    getCalendarEvents,
    createCalendarEvent,
    createReminderEvent,
    listDriveFiles,
    searchPhotos,
    getPlaylists,
    getSubscriptions
} from '../controllers/google.controller.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

// Gmail
router.get('/gmail/read', isAuth, readEmails);
router.post('/gmail/send', isAuth, sendEmail);

// Calendar
router.get('/calendar/events', isAuth, getCalendarEvents);
router.post('/calendar/events', isAuth, createCalendarEvent);
router.post('/calendar/reminder', isAuth, createReminderEvent);

// Google Drive
router.get('/drive/files', isAuth, listDriveFiles);

// Google Photos
router.get('/photos/search', isAuth, searchPhotos);

// YouTube
router.get('/youtube/playlists', isAuth, getPlaylists);
router.get('/youtube/subscriptions', isAuth, getSubscriptions);

export default router;
