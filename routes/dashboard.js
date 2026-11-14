
const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

router.get("/overview", dashboardController.getOverview);

router.get("/trends", dashboardController.getHealthTrends);

router.get(
  "/out-of-range",
  dashboardController.getOutOfRangeMeasurements
);

module.exports = router;
