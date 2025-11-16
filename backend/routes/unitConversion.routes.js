const express = require("express");
const {
  convertUnits,
  getSupportedConversions
} = require("../controllers/unitConversion.controller.js");

const router = express.Router();

// Unit conversion routes
router.get("/convert", convertUnits);
router.get("/supported", getSupportedConversions);

module.exports = router;
