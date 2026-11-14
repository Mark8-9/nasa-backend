
const express = require("express");
const router = express.Router();

const baselineController = require("../controllers/baselineController");

router.get(
  "/:astronautId/baseline",
  baselineController.getAstronautBaseline
);

router.get(
  "/:astronautId/baseline/:analyte",
  baselineController.getBaselineByAnalyte
);

module.exports = router;
