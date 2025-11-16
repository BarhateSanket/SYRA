const smartDevices = new Map(); // In-memory storage for demo purposes

const getDevices = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's devices (in a real app, this would come from database)
    const userDevices = Array.from(smartDevices.values()).filter(device => device.userId === userId);

    res.json({
      success: true,
      message: 'Smart devices retrieved successfully',
      data: userDevices
    });

  } catch (error) {
    console.error('Get devices error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve devices',
      data: null
    });
  }
};

const addDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, room, capabilities } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Device name and type are required',
        data: null
      });
    }

    const deviceId = Date.now().toString();
    const device = {
      id: deviceId,
      userId,
      name,
      type,
      room: room || 'Living Room',
      capabilities: capabilities || getDefaultCapabilities(type),
      status: 'offline',
      lastUpdated: new Date(),
      createdAt: new Date()
    };

    smartDevices.set(deviceId, device);

    res.status(201).json({
      success: true,
      message: 'Device added successfully',
      data: device
    });

  } catch (error) {
    console.error('Add device error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to add device',
      data: null
    });
  }
};

const controlDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { action, value } = req.body;
    const userId = req.user.id;

    const device = smartDevices.get(deviceId);

    if (!device || device.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
        data: null
      });
    }

    let responseMessage = '';
    let updatedDevice = { ...device };

    switch (action) {
      case 'turn_on':
      case 'turn_off':
        if (device.capabilities.includes('power')) {
          updatedDevice.status = action === 'turn_on' ? 'online' : 'offline';
          updatedDevice.power = action === 'turn_on';
          responseMessage = `${device.name} turned ${action === 'turn_on' ? 'on' : 'off'}`;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Device does not support power control',
            data: null
          });
        }
        break;

      case 'set_brightness':
        if (device.capabilities.includes('brightness')) {
          const brightness = Math.max(0, Math.min(100, parseInt(value) || 50));
          updatedDevice.brightness = brightness;
          updatedDevice.status = 'online';
          responseMessage = `${device.name} brightness set to ${brightness}%`;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Device does not support brightness control',
            data: null
          });
        }
        break;

      case 'set_temperature':
        if (device.capabilities.includes('temperature')) {
          const temperature = Math.max(10, Math.min(35, parseFloat(value) || 22));
          updatedDevice.temperature = temperature;
          updatedDevice.status = 'online';
          responseMessage = `${device.name} temperature set to ${temperature}°C`;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Device does not support temperature control',
            data: null
          });
        }
        break;

      case 'lock':
      case 'unlock':
        if (device.capabilities.includes('lock')) {
          updatedDevice.locked = action === 'lock';
          updatedDevice.status = 'online';
          responseMessage = `${device.name} ${action === 'lock' ? 'locked' : 'unlocked'}`;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Device does not support lock control',
            data: null
          });
        }
        break;

      case 'set_color':
        if (device.capabilities.includes('color')) {
          updatedDevice.color = value || '#ffffff';
          updatedDevice.status = 'online';
          responseMessage = `${device.name} color set to ${value}`;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Device does not support color control',
            data: null
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported action',
          data: null
        });
    }

    updatedDevice.lastUpdated = new Date();
    smartDevices.set(deviceId, updatedDevice);

    res.json({
      success: true,
      message: responseMessage,
      data: updatedDevice
    });

  } catch (error) {
    console.error('Control device error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to control device',
      data: null
    });
  }
};

const getDeviceStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user.id;

    const device = smartDevices.get(deviceId);

    if (!device || device.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Device status retrieved successfully',
      data: device
    });

  } catch (error) {
    console.error('Get device status error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to get device status',
      data: null
    });
  }
};

const removeDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user.id;

    const device = smartDevices.get(deviceId);

    if (!device || device.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
        data: null
      });
    }

    smartDevices.delete(deviceId);

    res.json({
      success: true,
      message: 'Device removed successfully',
      data: device
    });

  } catch (error) {
    console.error('Remove device error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to remove device',
      data: null
    });
  }
};

const getSupportedDeviceTypes = (req, res) => {
  const deviceTypes = {
    light: {
      name: 'Light',
      capabilities: ['power', 'brightness', 'color'],
      description: 'Smart lighting with brightness and color control'
    },
    thermostat: {
      name: 'Thermostat',
      capabilities: ['power', 'temperature'],
      description: 'Smart temperature control'
    },
    lock: {
      name: 'Smart Lock',
      capabilities: ['lock', 'power'],
      description: 'Smart door lock with remote control'
    },
    speaker: {
      name: 'Smart Speaker',
      capabilities: ['power', 'volume'],
      description: 'Smart speaker with voice control'
    },
    camera: {
      name: 'Security Camera',
      capabilities: ['power', 'recording'],
      description: 'Smart security camera'
    },
    sensor: {
      name: 'Sensor',
      capabilities: ['monitoring'],
      description: 'Environmental sensor (temperature, humidity, motion)'
    }
  };

  res.json({
    success: true,
    message: 'Supported device types retrieved',
    data: deviceTypes
  });
};

// Helper function to get default capabilities for a device type
function getDefaultCapabilities(type) {
  const capabilityMap = {
    light: ['power', 'brightness', 'color'],
    thermostat: ['power', 'temperature'],
    lock: ['lock', 'power'],
    speaker: ['power', 'volume'],
    camera: ['power', 'recording'],
    sensor: ['monitoring']
  };

  return capabilityMap[type] || ['power'];
}

// Initialize some demo devices for testing
const initializeDemoDevices = () => {
  const demoDevices = [
    {
      id: 'demo-light-1',
      userId: 'demo-user',
      name: 'Living Room Light',
      type: 'light',
      room: 'Living Room',
      capabilities: ['power', 'brightness', 'color'],
      status: 'offline',
      power: false,
      brightness: 50,
      color: '#ffffff',
      lastUpdated: new Date(),
      createdAt: new Date()
    },
    {
      id: 'demo-thermostat-1',
      userId: 'demo-user',
      name: 'Home Thermostat',
      type: 'thermostat',
      room: 'Living Room',
      capabilities: ['power', 'temperature'],
      status: 'offline',
      power: false,
      temperature: 22,
      lastUpdated: new Date(),
      createdAt: new Date()
    },
    {
      id: 'demo-lock-1',
      userId: 'demo-user',
      name: 'Front Door Lock',
      type: 'lock',
      room: 'Entrance',
      capabilities: ['lock', 'power'],
      status: 'offline',
      power: true,
      locked: true,
      lastUpdated: new Date(),
      createdAt: new Date()
    }
  ];

  demoDevices.forEach(device => {
    smartDevices.set(device.id, device);
  });

  console.log('Demo smart devices initialized');
};

module.exports = {
  getDevices,
  addDevice,
  controlDevice,
  getDeviceStatus,
  removeDevice,
  getSupportedDeviceTypes,
  initializeDemoDevices
};
