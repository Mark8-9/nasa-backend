
const { Astronaut, Measurement, Baseline } = require("../models/Index");

// GET /api/dashboard/overview
exports.getOverview = async (req, res, next) => {
  try {
    const [
      totalAstronauts,
      totalMeasurements,
      totalBaselines,
      outOfRangeCount,
    ] = await Promise.all([
      Astronaut.countDocuments(),
      Measurement.countDocuments(),
      Baseline.countDocuments(),

      Measurement.countDocuments({
        $or: [
          {
            refMin: { $ne: null },
            $expr: { $lt: ["$value", "$refMin"] },
          },
          {
            refMax: { $ne: null },
            $expr: { $gt: ["$value", "$refMax"] },
          },
        ],
      }),
    ]);

    res.status(200).json({
      message: "Dashboard overview fetched successfully",
      data: {
        totalAstronauts,
        totalMeasurements,
        totalBaselines,
        outOfRangeCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/trends?astronautId=C001&analyte=...
exports.getHealthTrends = async (req, res, next) => {
  try {
    const { astronautId, analyte, panel } = req.query;

    if (!astronautId || !analyte) {
      return res.status(400).json({
        message: "astronautId and analyte are required",
      });
    }

    if (panel && !["CBC", "CMP"].includes(panel)) {
      return res.status(400).json({
        message: "Panel must be CBC or CMP",
      });
    }

    const filter = {
      astronautId,
      analyte,
      ...(panel && { panel }),
    };

    const measurements = await Measurement.find(filter)
      .sort({ "timepoint.order": 1 })
      .select(
        "astronautId panel analyte unit value timepoint refMin refMax"
      );

    if (measurements.length === 0) {
      return res.status(404).json({
        message: "No measurements found",
      });
    }

    const baselineFilter = {
      astronautId,
      analyte,
      ...(panel && { panel }),
    };

    const baselines = await Baseline.find(baselineFilter);

    res.status(200).json({
      message: "Health trends fetched successfully",
      data: {
        measurements,
        baselines,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/out-of-range
exports.getOutOfRangeMeasurements = async (req, res, next) => {
  try {
    const { astronautId, panel } = req.query;

    const filter = {
      $or: [
        {
          refMin: { $ne: null },
          $expr: { $lt: ["$value", "$refMin"] },
        },
        {
          refMax: { $ne: null },
          $expr: { $gt: ["$value", "$refMax"] },
        },
      ],
    };

    if (astronautId) filter.astronautId = astronautId;

    if (panel) {
      if (!["CBC", "CMP"].includes(panel)) {
        return res.status(400).json({
          message: "Panel must be CBC or CMP",
        });
      }

      filter.panel = panel;
    }

    const measurements = await Measurement.find(filter).sort({
      "timepoint.order": -1,
    });

    res.status(200).json({
      message: "Out-of-range measurements fetched successfully",
      count: measurements.length,
      data: measurements,
    });
  } catch (error) {
    next(error);
  }
};
