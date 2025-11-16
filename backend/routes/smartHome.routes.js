import express from 'express';
import {
  getDevices,
  addDevice,
  controlDevice,
  getDeviceStatus,
  removeDevice,
  getSupportedDeviceTypes
} from '../controllers/smartHome.controller.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

// All smart home routes require authentication
router.use(isAuth);

// Smart home routes
router.get('/devices', getDevices);
router.post('/devices', addDevice);
router.get('/devices/types', getSupportedDeviceTypes);
router.get('/devices/:deviceId', getDeviceStatus);
router.put('/devices/:deviceId/control', controlDevice);
router.delete('/devices/:deviceId', removeDevice);

export default router;
