import express from 'express';
import {
    readEmails,
    sendEmail,
    getCalendarEvents,
    createCalendarEvent,
    listDriveFiles,
    searchPhotos,
    getPlaylists,
    getSubscriptions
} from '../controllers/google.controller.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

// Gmail routes
router.get('/gmail/read', isAuth, readEmails);
router.post('/gmail/send', isAuth, sendEmail);

// Calendar routes
router.get('/calendar/events', isAuth, getCalendarEvents);
router.post('/calendar/events', isAuth, createCalendarEvent);

// Drive routes
router.get('/drive/files', isAuth, listDriveFiles);

// Photos routes
router.get('/photos/search', isAuth, searchPhotos);

// YouTube routes
router.get('/youtube/playlists', isAuth, getPlaylists);
router.get('/youtube/subscriptions', isAuth, getSubscriptions);

export default router;
