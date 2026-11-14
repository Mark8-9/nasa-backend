
const { Measurement, Baseline } = require("../models/Index");
const { generateHealthSummary } = require("../services/aiService");

async function getAstronautAnalysis(req, res, next) {
  try {
    const { astronautId } = req.params;
    const { feature, panel } = req.query;

    // 1. Validate feature
    if (!feature || !feature.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please select a health feature",
      });
    }

    // Escape special regex characters
    const escapedFeature = feature.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // 2. Build database filter
    const filter = {
      astronautId,
      analyte: {
        $regex: `^${escapedFeature}$`,
        $options: "i",
      },
    };

    if (panel) {
      filter.panel = panel;
    }

    // 3. Fetch measurements and personal baseline
    const [measurements, baselines] = await Promise.all([
      Measurement.find(filter)
        .sort({ "timepoint.order": 1 })
        .limit(20)
        .lean(),

      Baseline.find(filter).lean(),
    ]);

    if (!measurements.length) {
      return res.status(404).json({
        success: false,
        message: `No data found for ${feature}`,
      });
    }

    // 4. Prepare readings for AI
    const readings = measurements.map((item) => ({
      timepoint: item.timepoint.label,
      phase: item.timepoint.phase,
      day: item.timepoint.day,
      value: item.value,
      unit: item.unit,
      refMin: item.refMin,
      refMax: item.refMax,
    }));

    const formattedBaselines = baselines.map((item) => ({
      value: item.value,
      unit: item.unit,
      panel: item.panel,
    }));

    // 5. Prepare AI input
    const aiData = {
      astronautId,
      feature,
      panel: panel || measurements[0].panel,
      readings,
      baselines: formattedBaselines,
    };

    // 6. Generate AI analysis
    const result = await generateHealthSummary(aiData);

    // 7. Send response to frontend
    return res.status(200).json({
      success: true,
      data: {
        astronautId,
        feature,
        panel: aiData.panel,
        readings,
        baselines: formattedBaselines,
        summary: result.summary,
        generatedBy: result.source,
        warning: result.warning || null,
      },
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAstronautAnalysis,
};
