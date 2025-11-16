// ==============================
// Unit Conversion Controller (ESM Version)
// ==============================

// MAIN CONTROLLER FUNCTION
export const convertUnits = (req, res) => {
  try {
    const { from, to, value, category } = req.query;

    if (!from || !to || !value || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: from, to, value, category",
        data: null,
      });
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return res.status(400).json({
        success: false,
        message: "Invalid value parameter",
        data: null,
      });
    }

    let result;
    let explanation = "";

    switch (category.toLowerCase()) {
      case "length":
      case "distance":
        result = convertLength(from.toLowerCase(), to.toLowerCase(), numValue);
        break;

      case "weight":
      case "mass":
        result = convertWeight(from.toLowerCase(), to.toLowerCase(), numValue);
        break;

      case "temperature":
        result = convertTemperature(from.toLowerCase(), to.toLowerCase(), numValue);
        break;

      case "volume":
        result = convertVolume(from.toLowerCase(), to.toLowerCase(), numValue);
        break;

      case "area":
        result = convertArea(from.toLowerCase(), to.toLowerCase(), numValue);
        break;

      case "speed":
        result = convertSpeed(from.toLowerCase(), to.toLowerCase(), numValue);
        break;

      case "time":
        result = convertTime(from.toLowerCase(), to.toLowerCase(), numValue);
        break;

      case "pressure":
        result = convertPressure(from.toLowerCase(), to.toLowerCase(), numValue);
        break;

      case "energy":
        result = convertEnergy(from.toLowerCase(), to.toLowerCase(), numValue);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported conversion category",
          data: null,
        });
    }

    if (result === null) {
      return res.status(400).json({
        success: false,
        message: "Unsupported unit conversion",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Unit conversion successful",
      data: {
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        value: numValue,
        result: Number(result.toFixed(6)),
        category: category.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("Unit conversion error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to perform unit conversion",
      data: null,
    });
  }
};

// ==============================
// Supported Conversions List
// ==============================

export const getSupportedConversions = (_req, res) => {
  res.json({
    success: true,
    message: "Supported conversions retrieved",
    data: {
      length: ["meter", "kilometer", "centimeter", "millimeter", "mile", "yard", "foot", "inch"],
      weight: ["kilogram", "gram", "milligram", "pound", "ounce", "ton"],
      temperature: ["celsius", "fahrenheit", "kelvin"],
      volume: ["liter", "milliliter", "cubic_meter", "cubic_centimeter", "gallon", "quart", "pint", "cup", "fluid_ounce"],
      area: ["square_meter", "square_kilometer", "square_centimeter", "square_millimeter", "square_mile", "square_yard", "square_foot", "square_inch", "acre", "hectare"],
      speed: ["meter_per_second", "kilometer_per_hour", "mile_per_hour", "knot", "foot_per_second"],
      time: ["second", "minute", "hour", "day", "week", "month", "year"],
      pressure: ["pascal", "kilopascal", "bar", "atmosphere", "torr", "mmhg", "psi"],
      energy: ["joule", "kilojoule", "calorie", "kilocalorie", "watt_hour", "kilowatt_hour", "btu"],
    },
  });
};

// ==============================
// Conversion tables (unchanged)
// ==============================

function convertLength(from, to, value) {
  const table = {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    mile: 1609.344,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
  };

  if (!table[from] || !table[to]) return null;
  return (value * table[from]) / table[to];
}

function convertWeight(from, to, value) {
  const table = {
    kilogram: 1,
    gram: 0.001,
    milligram: 0.000001,
    pound: 0.453592,
    ounce: 0.0283495,
    ton: 1000,
  };

  if (!table[from] || !table[to]) return null;
  return (value * table[from]) / table[to];
}

function convertTemperature(from, to, value) {
  let c;

  if (from === "celsius") c = value;
  else if (from === "fahrenheit") c = (value - 32) * 5 / 9;
  else if (from === "kelvin") c = value - 273.15;
  else return null;

  if (to === "celsius") return c;
  if (to === "fahrenheit") return c * 9 / 5 + 32;
  if (to === "kelvin") return c + 273.15;

  return null;
}

function convertVolume(from, to, value) {
  const table = {
    liter: 1,
    milliliter: 0.001,
    cubic_meter: 1000,
    cubic_centimeter: 0.001,
    gallon: 3.78541,
    quart: 0.946353,
    pint: 0.473176,
    cup: 0.236588,
    fluid_ounce: 0.0295735,
  };

  if (!table[from] || !table[to]) return null;
  return (value * table[from]) / table[to];
}

function convertArea(from, to, value) {
  const table = {
    square_meter: 1,
    square_kilometer: 1000000,
    square_centimeter: 0.0001,
    square_millimeter: 0.000001,
    square_mile: 2589988.11,
    square_yard: 0.836127,
    square_foot: 0.092903,
    square_inch: 0.00064516,
    acre: 4046.86,
    hectare: 10000,
  };

  if (!table[from] || !table[to]) return null;
  return (value * table[from]) / table[to];
}

function convertSpeed(from, to, value) {
  const table = {
    meter_per_second: 1,
    kilometer_per_hour: 0.277778,
    mile_per_hour: 0.44704,
    knot: 0.514444,
    foot_per_second: 0.3048,
  };

  if (!table[from] || !table[to]) return null;
  return (value * table[from]) / table[to];
}

function convertTime(from, to, value) {
  const table = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2629746,
    year: 31556952,
  };

  if (!table[from] || !table[to]) return null;
  return (value * table[from]) / table[to];
}

function convertPressure(from, to, value) {
  const table = {
    pascal: 1,
    kilopascal: 1000,
    bar: 100000,
    atmosphere: 101325,
    torr: 133.322,
    mmhg: 133.322,
    psi: 6894.76,
  };

  if (!table[from] || !table[to]) return null;
  return (value * table[from]) / table[to];
}

function convertEnergy(from, to, value) {
  const table = {
    joule: 1,
    kilojoule: 1000,
    calorie: 4.184,
    kilocalorie: 4184,
    watt_hour: 3600,
    kilowatt_hour: 3600000,
    btu: 1055.06,
  };

  if (!table[from] || !table[to]) return null;
  return (value * table[from]) / table[to];
}
