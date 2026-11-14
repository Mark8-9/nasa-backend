const express = require("express");

const router = express.Router();

const astronautController = require("../controllers/astronautController");

router.get("/", astronautController.getAllAstronauts);

router.get("/:astronautId", astronautController.getAstronautById);

router.get("/:astronautId/summary", astronautController.getAstronautSummary);

module.exports = router;