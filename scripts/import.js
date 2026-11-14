
const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const {
  Astronaut,
  Measurement,
  Baseline
} = require("../models/Index");

const connectDB = require("../config/db");

// Read CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) =>
            header.replace(/^\uFEFF/, "").trim()
        })
      )
      .on("data", row => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

// Convert string to number
function toNumber(value) {
  if (value === undefined || value === null || value.trim() === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

// Parse timepoint
function parseTimepoint(label) {
  const isPre = label.startsWith("L-");
  const day = Number(label.substring(2));

  const actualDay = isPre ? -day : day;

  return {
    label,
    phase: isPre ? "pre" : "post",
    day: actualDay,
    order: actualDay
  };
}

// Main import function
async function importDataset() {
  try {
    await connectDB();

    const baselinePath = path.join(
      __dirname,
      "../data/NASA_Personalized_Baseline.csv"
    );

    const readingsPath = path.join(
      __dirname,
      "../data/NASA_4_Astronauts_Cleaned.csv"
    );

    // Read both files
    const baselineRows = await readCSV(baselinePath);
    const readingRows = await readCSV(readingsPath);

    console.log("CSV files loaded");

    // Check astronaut IDs
    const baselineIds = baselineRows.map(row => row.Astronaut_ID);
    const readingIds = readingRows.map(row => row.Astronaut_ID);

    const allIds = new Set([...baselineIds, ...readingIds]);

    if (
      baselineIds.some(id => !id) ||
      readingIds.some(id => !id) ||
      baselineIds.length !== allIds.size ||
      readingIds.length !== allIds.size ||
      [...allIds].some(id =>
        !baselineIds.includes(id) || !readingIds.includes(id)
      )
    ) {
      throw new Error("Astronaut IDs are missing, duplicated or mismatched");
    }

    // =================================
    // 1. Import Astronauts
    // =================================

    const astronautOps = [...allIds].map(astronautId => ({
      updateOne: {
        filter: { astronautId },
        update: {
          $setOnInsert: { astronautId }
        },
        upsert: true
      }
    }));

    await Astronaut.bulkWrite(astronautOps);

    console.log("Astronauts imported:", astronautOps.length);

    // =================================
    // 2. Import Baselines
    // =================================

    const baselineOps = [];

    for (const row of baselineRows) {
      const astronautId = row.Astronaut_ID;

      for (const [column, rawValue] of Object.entries(row)) {
        if (column === "Astronaut_ID") continue;

        const match = column.match(
          /^(CBC|CMP)_(.+)_value_(.+)$/
        );

        if (!match) continue;

        const [, panel, analyte, unit] = match;

        const value = toNumber(rawValue);

        if (value === null) continue;

        baselineOps.push({
          updateOne: {
            filter: {
              astronautId,
              panel,
              analyte
            },

            update: {
              $set: {
                astronautId,
                panel,
                analyte,
                unit,
                value,
                method: "personalized_dataset"
              }
            },

            upsert: true
          }
        });
      }
    }

    if (baselineOps.length) {
      await Baseline.bulkWrite(baselineOps);
    }

    console.log("Baselines imported:", baselineOps.length);

    // =================================
    // 3. Import Measurements
    // =================================

    const measurementOps = [];

    for (const row of readingRows) {
      const astronautId = row.Astronaut_ID;

      for (const [column, rawValue] of Object.entries(row)) {
        const match = column.match(
          /^(CBC|CMP)_(.+)_value_(.+)_(L-\d+|R\+\d+)$/
        );

        if (!match) continue;

        const [, panel, analyte, unit, label] = match;

        const value = toNumber(rawValue);

        if (value === null) continue;

        const timepoint = parseTimepoint(label);

        // Get reference ranges
        const minColumn =
          `${panel}_${analyte}_range_min_${unit}_${label}`;

        const maxColumn =
          `${panel}_${analyte}_range_max_${unit}_${label}`;

        const refMin = toNumber(row[minColumn]);
        const refMax = toNumber(row[maxColumn]);

        measurementOps.push({
          updateOne: {
            filter: {
              astronautId,
              panel,
              analyte,
              "timepoint.label": label
            },

            update: {
              $set: {
                astronautId,
                panel,
                analyte,
                unit,
                value,
                timepoint,
                refMin,
                refMax,
                source: "dataset"
              }
            },

            upsert: true
          }
        });
      }
    }

    if (measurementOps.length) {
      await Measurement.bulkWrite(measurementOps);
    }

    console.log(
      "Measurements imported:",
      measurementOps.length
    );

    console.log("Dataset import completed!");

  } catch (error) {
    console.error("Import Error:", error);

    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
}

importDataset();
