// routes/measurment.js
const express = require("express");
const router = express.Router();

const measurementController = require("../controllers/measurementController");

router.get(
  "/:astronautId/measurements",
  measurementController.getMeasurements
);

router.get(
  "/:astronautId/measurements/latest",
  measurementController.getLatestMeasurements
);

router.get(
  "/:astronautId/measurements/compare",
  measurementController.compareWithBaseline
);

router.get(
  "/:astronautId/measurements/:analyte",
  measurementController.getMeasurementByAnalyte
);

router.post(
  "/measurements",
  measurementController.createMeasurementFromMobile
);

module.exports = router;