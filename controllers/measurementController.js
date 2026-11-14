
const { Measurement, Baseline, Astronaut } = require("../models/Index");

// GET /api/astronauts/:astronautId/measurements
exports.getMeasurements = async (req, res, next) => {
  try {
    const { astronautId } = req.params;
    const { panel, phase, analyte, timepoint } = req.query;

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

    if (phase) {
      if (!["pre", "inflight", "post"].includes(phase)) {
        return res.status(400).json({
          message: "Invalid phase",
        });
      }

      filter["timepoint.phase"] = phase;
    }

    if (analyte) filter.analyte = analyte;

    if (timepoint) {
      filter["timepoint.label"] = timepoint;
    }

    const measurements = await Measurement.find(filter).sort({
      "timepoint.order": 1,
      analyte: 1,
    });

    res.status(200).json({
      message: "Measurements fetched successfully",
      count: measurements.length,
      data: measurements,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/astronauts/:astronautId/measurements/:analyte
exports.getMeasurementByAnalyte = async (req, res, next) => {
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

    const measurements = await Measurement.find(filter).sort({
      "timepoint.order": 1,
    });

    if (measurements.length === 0) {
      return res.status(404).json({
        message: "Measurements not found",
      });
    }

    res.status(200).json({
      message: "Measurements fetched successfully",
      count: measurements.length,
      data: measurements,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/astronauts/:astronautId/measurements/latest
exports.getLatestMeasurements = async (req, res, next) => {
  try {
    const { astronautId } = req.params;

    const astronaut = await Astronaut.findOne({ astronautId });

    if (!astronaut) {
      return res.status(404).json({
        message: "Astronaut not found",
      });
    }

    const latestMeasurements = await Measurement.aggregate([
      { $match: { astronautId } },
      {
        $sort: {
          "timepoint.order": -1,
        },
      },
      {
        $group: {
          _id: {
            panel: "$panel",
            analyte: "$analyte",
          },
          measurement: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$measurement",
        },
      },
      {
        $sort: {
          panel: 1,
          analyte: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "Latest measurements fetched successfully",
      count: latestMeasurements.length,
      data: latestMeasurements,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/astronauts/:astronautId/measurements/compare
exports.compareWithBaseline = async (req, res, next) => {
  try {
    const { astronautId } = req.params;
    const { panel, analyte } = req.query;

    const filter = { astronautId };

    if (panel) {
      if (!["CBC", "CMP"].includes(panel)) {
        return res.status(400).json({
          message: "Panel must be CBC or CMP",
        });
      }

      filter.panel = panel;
    }

    if (analyte) filter.analyte = analyte;

    const [measurements, baselines] = await Promise.all([
      Measurement.find(filter).sort({
        "timepoint.order": 1,
      }),
      Baseline.find({
        astronautId,
        ...(panel && { panel }),
        ...(analyte && { analyte }),
      }),
    ]);

    const baselineMap = new Map(
      baselines.map((item) => [
        `${item.panel}:${item.analyte}`,
        item.value,
      ])
    );

    const comparison = measurements.map((measurement) => {
      const key = `${measurement.panel}:${measurement.analyte}`;
      const baselineValue = baselineMap.get(key);

      return {
        astronautId,
        panel: measurement.panel,
        analyte: measurement.analyte,
        unit: measurement.unit,
        timepoint: measurement.timepoint,
        value: measurement.value,
        baselineValue: baselineValue ?? null,
        difference:
          baselineValue === undefined
            ? null
            : measurement.value - baselineValue,
        percentageChange:
          baselineValue === undefined || baselineValue === 0
            ? null
            : ((measurement.value - baselineValue) /
                Math.abs(baselineValue)) * 100,
      };
    });

    res.status(200).json({
      message: "Baseline comparison completed",
      count: comparison.length,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
};

exports.createMeasurementFromMobile=async(req, res, next)=>{
  try {
    const astronautId = req.params.astronautId || req.body.astronautId;
    const { analyte, value, panel } = req.body;

    // الموبايل محتاج يبعت التلاتة دول بس
    if (!astronautId || !analyte || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "astronautId, analyte, and value are required",
      });
    }

    const cleanAnalyte = String(analyte).toLowerCase().trim();

    // 1. البحث في الداتابيز عن نفس الـ analyte عشان نجيب منه (unit, refMin, refMax, panel)
    // ובنفس الوقت نجيب آخر قراءة للرائد عشان نعرف آخر timepoint وصل له كام
    const [analyteTemplate, latestAstronautReading] = await Promise.all([
      Measurement.findOne({
        analyte: { $regex: `^${cleanAnalyte}$`, $options: "i" },
      }).lean(),

      Measurement.findOne({ astronautId })
        .sort({ "timepoint.order": -1 })
        .lean(),
    ]);

    if (!analyteTemplate) {
      return res.status(404).json({
        success: false,
        message: `Analyte '${cleanAnalyte}' not found in database reference`,
      });
    }

    // 2. حساب الـ timepoint الجديد تلقائياً (بناءً على آخر يوم مسجل في الداتابيز)
    const lastDay = latestAstronautReading?.timepoint?.day ?? 194;
    const nextDay = lastDay >= 0 ? lastDay + 1 : 1;

    const autoTimepoint = req.body.timepoint || {
      label: `R+${nextDay}`,
      phase: "post",
      day: nextDay,
      order: nextDay,
    };

    // 3. التأكد من وجود رائد الفضاء
    await Astronaut.findOneAndUpdate(
      { astronautId },
      { $setOnInsert: { astronautId } },
      { upsert: true, new: true }
    );

    // 4. حفظ القراءة الجديدة بعد تكميل بياناتها من الداتابيز
    const newMeasurement = await Measurement.create({
      astronautId,
      analyte: analyteTemplate.analyte, // الاسم الموحد من الداتابيز
      panel: panel || analyteTemplate.panel, // CBC أو CMP من الداتابيز
      value: Number(value),
      unit: analyteTemplate.unit, // الوحدة من الداتابيز
      refMin: analyteTemplate.refMin, // الحد الأدنى من الداتابيز
      refMax: analyteTemplate.refMax, // الحد الأقصى من الداتابيز
      source: "mobile",
      timepoint: autoTimepoint,
    });

    return res.status(201).json({
      success: true,
      message: "Measurement saved and enriched from database successfully",
      data: newMeasurement,
    });
  } catch (error) {
    next(error);
  }
}

