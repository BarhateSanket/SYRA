// In-memory storage for smart devices (per backend instance)
const smartDevices = new Map();

/* ------------------------------------------------------------
   GET ALL DEVICES
------------------------------------------------------------- */
export const getDevices = async (req, res) => {
  try {
    const userId = req.userId;

    const userDevices = Array.from(smartDevices.values()).filter(
      (device) => device.userId === userId
    );

    res.json({
      success: true,
      message: "Smart devices retrieved successfully",
      data: userDevices,
    });
  } catch (error) {
    console.error("Get devices error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve devices",
      data: null,
    });
  }
};

/* ------------------------------------------------------------
   ADD DEVICE
------------------------------------------------------------- */
export const addDevice = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, type, room, capabilities } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Device name and type are required",
        data: null,
      });
    }

    const deviceId = Date.now().toString();

    const device = {
      id: deviceId,
      userId,
      name,
      type,
      room: room || "Living Room",
      capabilities: capabilities || getDefaultCapabilities(type),
      status: "offline",
      lastUpdated: new Date(),
      createdAt: new Date(),
    };

    smartDevices.set(deviceId, device);

    res.status(201).json({
      success: true,
      message: "Device added successfully",
      data: device,
    });
  } catch (error) {
    console.error("Add device error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add device",
      data: null,
    });
  }
};

/* ------------------------------------------------------------
   CONTROL DEVICE
------------------------------------------------------------- */
export const controlDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { action, value } = req.body;
    const userId = req.userId;

    const device = smartDevices.get(deviceId);

    if (!device || device.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
        data: null,
      });
    }

    let updated = { ...device };
    let message = "";

    switch (action) {
      case "turn_on":
      case "turn_off":
        if (!device.capabilities.includes("power")) {
          return invalidCapability(res, "power");
        }
        updated.status = action === "turn_on" ? "online" : "offline";
        updated.power = action === "turn_on";
        message = `${device.name} turned ${updated.power ? "on" : "off"}`;
        break;

      case "set_brightness":
        if (!device.capabilities.includes("brightness")) {
          return invalidCapability(res, "brightness");
        }
        updated.brightness = Math.max(
          0,
          Math.min(100, parseInt(value) || 50)
        );
        updated.status = "online";
        message = `${device.name} brightness set to ${updated.brightness}%`;
        break;

      case "set_temperature":
        if (!device.capabilities.includes("temperature")) {
          return invalidCapability(res, "temperature");
        }
        updated.temperature = Math.max(
          10,
          Math.min(35, parseFloat(value) || 22)
        );
        updated.status = "online";
        message = `${device.name} temperature set to ${updated.temperature}°C`;
        break;

      case "lock":
      case "unlock":
        if (!device.capabilities.includes("lock")) {
          return invalidCapability(res, "lock");
        }
        updated.locked = action === "lock";
        updated.status = "online";
        message = `${device.name} ${updated.locked ? "locked" : "unlocked"}`;
        break;

      case "set_color":
        if (!device.capabilities.includes("color")) {
          return invalidCapability(res, "color");
        }
        updated.color = value || "#ffffff";
        updated.status = "online";
        message = `${device.name} color set to ${updated.color}`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported action",
          data: null,
        });
    }

    updated.lastUpdated = new Date();
    smartDevices.set(deviceId, updated);

    res.json({
      success: true,
      message,
      data: updated,
    });
  } catch (error) {
    console.error("Control device error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to control device",
      data: null,
    });
  }
};

/* ------------------------------------------------------------
   GET DEVICE STATUS
------------------------------------------------------------- */
export const getDeviceStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.userId;

    const device = smartDevices.get(deviceId);

    if (!device || device.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Device status retrieved successfully",
      data: device,
    });
  } catch (error) {
    console.error("Get device status error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve device status",
      data: null,
    });
  }
};

/* ------------------------------------------------------------
   REMOVE DEVICE
------------------------------------------------------------- */
export const removeDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.userId;

    const device = smartDevices.get(deviceId);

    if (!device || device.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
        data: null,
      });
    }

    smartDevices.delete(deviceId);

    res.json({
      success: true,
      message: "Device removed successfully",
      data: device,
    });
  } catch (error) {
    console.error("Remove device error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to remove device",
      data: null,
    });
  }
};

/* ------------------------------------------------------------
   SUPPORTED DEVICE TYPES
------------------------------------------------------------- */
export const getSupportedDeviceTypes = (req, res) => {
  const deviceTypes = {
    light: {
      name: "Light",
      capabilities: ["power", "brightness", "color"],
      description: "Smart lighting with brightness and color control",
    },
    thermostat: {
      name: "Thermostat",
      capabilities: ["power", "temperature"],
      description: "Smart temperature control",
    },
    lock: {
      name: "Smart Lock",
      capabilities: ["lock", "power"],
      description: "Smart door lock with remote control",
    },
    speaker: {
      name: "Smart Speaker",
      capabilities: ["power", "volume"],
      description: "Smart music and audio device",
    },
    camera: {
      name: "Security Camera",
      capabilities: ["power", "recording"],
      description: "Smart surveillance camera",
    },
    sensor: {
      name: "Sensor",
      capabilities: ["monitoring"],
      description: "Temperature, motion, humidity sensor",
    },
  };

  res.json({
    success: true,
    message: "Supported device types retrieved",
    data: deviceTypes,
  });
};

/* ------------------------------------------------------------
   DEFAULT CAPABILITIES
------------------------------------------------------------- */
function getDefaultCapabilities(type) {
  const capabilityMap = {
    light: ["power", "brightness", "color"],
    thermostat: ["power", "temperature"],
    lock: ["lock", "power"],
    speaker: ["power", "volume"],
    camera: ["power", "recording"],
    sensor: ["monitoring"],
  };

  return capabilityMap[type] || ["power"];
}

/* ------------------------------------------------------------
   INITIALIZE DEMO DEVICES
------------------------------------------------------------- */
export const initializeDemoDevices = () => {
  const demoDevices = [
    {
      id: "demo-light-1",
      userId: "demo-user",
      name: "Living Room Light",
      type: "light",
      room: "Living Room",
      capabilities: ["power", "brightness", "color"],
      status: "offline",
      power: false,
      brightness: 50,
      color: "#ffffff",
      lastUpdated: new Date(),
      createdAt: new Date(),
    },
    {
      id: "demo-thermostat-1",
      userId: "demo-user",
      name: "Home Thermostat",
      type: "thermostat",
      room: "Living Room",
      capabilities: ["power", "temperature"],
      status: "offline",
      power: false,
      temperature: 22,
      lastUpdated: new Date(),
      createdAt: new Date(),
    },
    {
      id: "demo-lock-1",
      userId: "demo-user",
      name: "Front Door Lock",
      type: "lock",
      room: "Entrance",
      capabilities: ["lock", "power"],
      status: "offline",
      power: true,
      locked: true,
      lastUpdated: new Date(),
      createdAt: new Date(),
    },
  ];

  demoDevices.forEach((d) => smartDevices.set(d.id, d));

  console.log("Demo smart devices initialized");
};

/* ------------------------------------------------------------
   UTILITY: INVALID CAPABILITY HANDLER
------------------------------------------------------------- */
function invalidCapability(res, capability) {
  return res.status(400).json({
    success: false,
    message: `Device does not support ${capability} control`,
    data: null,
  });
}
