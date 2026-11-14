const express = require("express");
const router = express.Router();

const { getAstronautAnalysis } =
  require("../controllers/aiController");

router.get(
  "/astronauts/:astronautId/analysis",
  getAstronautAnalysis
);

router.get(
  "/astronauts/:astronautId/analysis",
  getAstronautAnalysis
);

module.exports = router;