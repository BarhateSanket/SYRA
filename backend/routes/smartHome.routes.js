import express from "express";
import {
  getDevices,
  addDevice,
  controlDevice,
  getDeviceStatus,
  removeDevice,
  getSupportedDeviceTypes
} from "../controllers/smartHome.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// All routes require user authentication
router.use(isAuth);

// Smart Home Device Routes
router.get("/devices", getDevices);                   // Get all devices
router.post("/devices", addDevice);                  // Add a new device
router.get("/devices/types", getSupportedDeviceTypes); // Get supported device types
router.get("/devices/:deviceId", getDeviceStatus);     // Get status of a device
router.put("/devices/:deviceId/control", controlDevice); // Control a specific device
router.delete("/devices/:deviceId", removeDevice);      // Delete a device

export default router;
