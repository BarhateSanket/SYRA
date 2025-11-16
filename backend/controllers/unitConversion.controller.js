const convertUnits = (req, res) => {
  try {
    const { from, to, value, category } = req.query;

    if (!from || !to || !value || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: from, to, value, category',
        data: null
      });
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid value parameter',
        data: null
      });
    }

    let result;
    let explanation = '';

    switch (category.toLowerCase()) {
      case 'length':
      case 'distance':
        result = convertLength(from.toLowerCase(), to.toLowerCase(), numValue);
        explanation = `${numValue} ${from} = ${result} ${to}`;
        break;

      case 'weight':
      case 'mass':
        result = convertWeight(from.toLowerCase(), to.toLowerCase(), numValue);
        explanation = `${numValue} ${from} = ${result} ${to}`;
        break;

      case 'temperature':
        result = convertTemperature(from.toLowerCase(), to.toLowerCase(), numValue);
        explanation = `${numValue}° ${from} = ${result}° ${to}`;
        break;

      case 'volume':
        result = convertVolume(from.toLowerCase(), to.toLowerCase(), numValue);
        explanation = `${numValue} ${from} = ${result} ${to}`;
        break;

      case 'area':
        result = convertArea(from.toLowerCase(), to.toLowerCase(), numValue);
        explanation = `${numValue} ${from} = ${result} ${to}`;
        break;

      case 'speed':
        result = convertSpeed(from.toLowerCase(), to.toLowerCase(), numValue);
        explanation = `${numValue} ${from} = ${result} ${to}`;
        break;

      case 'time':
        result = convertTime(from.toLowerCase(), to.toLowerCase(), numValue);
        explanation = `${numValue} ${from} = ${result} ${to}`;
        break;

      case 'pressure':
        result = convertPressure(from.toLowerCase(), to.toLowerCase(), numValue);
        explanation = `${numValue} ${from} = ${result} ${to}`;
        break;

      case 'energy':
        result = convertEnergy(from.toLowerCase(), to.toLowerCase(), numValue);
        explanation = `${numValue} ${from} = ${result} ${to}`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported conversion category',
          data: null
        });
    }

    if (result === null) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported unit conversion',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Unit conversion successful',
      data: {
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        value: numValue,
        result: Math.round(result * 1000000) / 1000000, // Round to 6 decimal places
        category: category.toLowerCase(),
        explanation
      }
    });

  } catch (error) {
    console.error('Unit conversion error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to perform unit conversion',
      data: null
    });
  }
};

const getSupportedConversions = (req, res) => {
  const conversions = {
    length: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch'],
    weight: ['kilogram', 'gram', 'milligram', 'pound', 'ounce', 'ton'],
    temperature: ['celsius', 'fahrenheit', 'kelvin'],
    volume: ['liter', 'milliliter', 'cubic_meter', 'cubic_centimeter', 'gallon', 'quart', 'pint', 'cup', 'fluid_ounce'],
    area: ['square_meter', 'square_kilometer', 'square_centimeter', 'square_millimeter', 'square_mile', 'square_yard', 'square_foot', 'square_inch', 'acre', 'hectare'],
    speed: ['meter_per_second', 'kilometer_per_hour', 'mile_per_hour', 'knot', 'foot_per_second'],
    time: ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
    pressure: ['pascal', 'kilopascal', 'bar', 'atmosphere', 'torr', 'mmhg', 'psi'],
    energy: ['joule', 'kilojoule', 'calorie', 'kilocalorie', 'watt_hour', 'kilowatt_hour', 'btu']
  };

  res.json({
    success: true,
    message: 'Supported conversions retrieved',
    data: conversions
  });
};

// Length conversions (base unit: meter)
function convertLength(from, to, value) {
  const toMeter = {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    mile: 1609.344,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254
  };

  if (!toMeter[from] || !toMeter[to]) return null;

  const meters = value * toMeter[from];
  return meters / toMeter[to];
}

// Weight conversions (base unit: kilogram)
function convertWeight(from, to, value) {
  const toKilogram = {
    kilogram: 1,
    gram: 0.001,
    milligram: 0.000001,
    pound: 0.453592,
    ounce: 0.0283495,
    ton: 1000
  };

  if (!toKilogram[from] || !toKilogram[to]) return null;

  const kilograms = value * toKilogram[from];
  return kilograms / toKilogram[to];
}

// Temperature conversions
function convertTemperature(from, to, value) {
  let celsius;

  // Convert to Celsius first
  switch (from) {
    case 'celsius':
      celsius = value;
      break;
    case 'fahrenheit':
      celsius = (value - 32) * 5/9;
      break;
    case 'kelvin':
      celsius = value - 273.15;
      break;
    default:
      return null;
  }

  // Convert from Celsius to target unit
  switch (to) {
    case 'celsius':
      return celsius;
    case 'fahrenheit':
      return (celsius * 9/5) + 32;
    case 'kelvin':
      return celsius + 273.15;
    default:
      return null;
  }
}

// Volume conversions (base unit: liter)
function convertVolume(from, to, value) {
  const toLiter = {
    liter: 1,
    milliliter: 0.001,
    cubic_meter: 1000,
    cubic_centimeter: 0.001,
    gallon: 3.78541,
    quart: 0.946353,
    pint: 0.473176,
    cup: 0.236588,
    fluid_ounce: 0.0295735
  };

  if (!toLiter[from] || !toLiter[to]) return null;

  const liters = value * toLiter[from];
  return liters / toLiter[to];
}

// Area conversions (base unit: square meter)
function convertArea(from, to, value) {
  const toSquareMeter = {
    square_meter: 1,
    square_kilometer: 1000000,
    square_centimeter: 0.0001,
    square_millimeter: 0.000001,
    square_mile: 2589988.11,
    square_yard: 0.836127,
    square_foot: 0.092903,
    square_inch: 0.00064516,
    acre: 4046.86,
    hectare: 10000
  };

  if (!toSquareMeter[from] || !toSquareMeter[to]) return null;

  const squareMeters = value * toSquareMeter[from];
  return squareMeters / toSquareMeter[to];
}

// Speed conversions (base unit: meter per second)
function convertSpeed(from, to, value) {
  const toMeterPerSecond = {
    meter_per_second: 1,
    kilometer_per_hour: 0.277778,
    mile_per_hour: 0.44704,
    knot: 0.514444,
    foot_per_second: 0.3048
  };

  if (!toMeterPerSecond[from] || !toMeterPerSecond[to]) return null;

  const metersPerSecond = value * toMeterPerSecond[from];
  return metersPerSecond / toMeterPerSecond[to];
}

// Time conversions (base unit: second)
function convertTime(from, to, value) {
  const toSecond = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2629746, // Average month (365.25 days / 12)
    year: 31556952 // Average year
  };

  if (!toSecond[from] || !toSecond[to]) return null;

  const seconds = value * toSecond[from];
  return seconds / toSecond[to];
}

// Pressure conversions (base unit: pascal)
function convertPressure(from, to, value) {
  const toPascal = {
    pascal: 1,
    kilopascal: 1000,
    bar: 100000,
    atmosphere: 101325,
    torr: 133.322,
    mmhg: 133.322,
    psi: 6894.76
  };

  if (!toPascal[from] || !toPascal[to]) return null;

  const pascals = value * toPascal[from];
  return pascals / toPascal[to];
}

// Energy conversions (base unit: joule)
function convertEnergy(from, to, value) {
  const toJoule = {
    joule: 1,
    kilojoule: 1000,
    calorie: 4.184,
    kilocalorie: 4184,
    watt_hour: 3600,
    kilowatt_hour: 3600000,
    btu: 1055.06
  };

  if (!toJoule[from] || !toJoule[to]) return null;

  const joules = value * toJoule[from];
  return joules / toJoule[to];
}

module.exports = {
  convertUnits,
  getSupportedConversions
};
