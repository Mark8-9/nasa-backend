
const { Baseline, Astronaut } = require("../models/Index");

exports.getAstronautBaseline = async (req, res, next) => {
  try {
    const { astronautId } = req.params;
    const { panel } = req.query;

    const astronaut = await Astronaut.findOne({ astronautId });

    if (!astronaut) {
      return res.status(404).json({
        message: "Astronaut not found",
      });
    }

    const filter = { astronautId };

    if (panel) {
      if (!["CBC", "CMP"].includes(panel)) {
        return res.status(400).json({
          message: "Panel must be CBC or CMP",
        });
      }

      filter.panel = panel;
    }

    const baselines = await Baseline.find(filter).sort({
      panel: 1,
      analyte: 1,
    });

    res.status(200).json({
      message: "Baseline fetched successfully",
      count: baselines.length,
      data: baselines,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/astronauts/:astronautId/baseline/:analyte
exports.getBaselineByAnalyte = async (req, res, next) => {
  try {
    const { astronautId, analyte } = req.params;
    const { panel } = req.query;

    const filter = { astronautId, analyte };

    if (panel) {
      if (!["CBC", "CMP"].includes(panel)) {
        return res.status(400).json({
          message: "Panel must be CBC or CMP",
        });
      }

      filter.panel = panel;
    }

    const baselines = await Baseline.find(filter);

    if (baselines.length === 0) {
      return res.status(404).json({
        message: "Baseline not found",
      });
    }

    res.status(200).json({
      message: "Baseline fetched successfully",
      count: baselines.length,
      data: baselines,
    });
  } catch (error) {
    next(error);
  }
};
