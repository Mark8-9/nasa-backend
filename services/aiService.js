
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const summaryCache = new Map();

function buildInstantReport(data) {
  const { astronautId, feature, readings = [], baselines = [] } = data;

  if (!readings.length) {
    return "Insufficient data to generate an analysis.";
  }

  const values = readings.map(r => Number(r.value))
    .filter(Number.isFinite);

  const baseline = baselines[0]?.value;
  const latest = readings[readings.length - 1];

  const outOfRange = readings.filter(r =>
    (r.refMin != null && r.value < r.refMin) ||
    (r.refMax != null && r.value > r.refMax)
  );

  const hasReferenceRanges = readings.some(
    r => r.refMin != null || r.refMax != null
  );

  return `
1. Summary:
${feature} has ${readings.length} recorded measurements for ${astronautId}.

2. Baseline Comparison:
${baseline != null
  ? `Baseline: ${baseline}. Latest: ${latest.value} ${latest.unit}.`
  : "No personal baseline is available."}

3. Reference Range:
${hasReferenceRanges
  ? `${outOfRange.length} readings are outside their available reference ranges.`
  : "Reference range information is unavailable."}

4. Monitoring:
Review the trend and continue scheduled monitoring.

5. Medical Team:
${outOfRange.length
  ? "The out-of-range readings should be reviewed by the medical team."
  : "No conclusion about clinical safety can be made from these data alone."}

Note: This is a rule-based fallback, not a Gemini-generated recommendation.
`;
}

async function generateHealthSummary(data) {
  const cacheKey = JSON.stringify({
    astronautId: data.astronautId,
    feature: data.feature,
    panel: data.panel,
    readings: data.readings,
    baselines: data.baselines,
  });

  if (summaryCache.has(cacheKey)) {
    return {
      summary: summaryCache.get(cacheKey),
      source: "cache",
    };
  }

  const prompt = `
You are an assistant for an astronaut health monitoring dashboard.

Analyze this data:
${JSON.stringify(data)}

Return:
1. Summary.
2. Personal baseline comparison.
3. Reference range observations.
4. Monitoring recommendations.
5. Medical team observations.

Rules:
- Never diagnose diseases.
- Never invent data.
- Do not call missing reference ranges normal.
- Do not confuse personal baseline with clinical reference range.
- Use cautious, evidence-based language.
- Maximum 150 words.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        abortSignal: AbortSignal.timeout(20000),
      },
    });

    const summary = response.text;

    if (!summary) {
      throw new Error("Gemini returned an empty response");
    }

    summaryCache.set(cacheKey, summary);

    return {
      summary,
      source: "gemini",
    };

  } catch (error) {
    console.error("Gemini Error:", error.message);

    return {
      summary: buildInstantReport(data),
      source: "rule-based-fallback",
      warning: "Gemini was unavailable. This is not an AI-generated result.",
    };
  }
}

module.exports = { generateHealthSummary };
