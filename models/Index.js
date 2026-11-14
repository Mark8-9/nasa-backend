
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Astronaut
const astronautSchema = new Schema(
  {
    astronautId: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

// Measurement
const measurementSchema = new Schema(
  {
    astronautId: {
      type: String,
      required: true,
      index: true
    },

    panel: {
      type: String,
      enum: ["CBC", "CMP"],
      required: true
    },

    analyte: {
      type: String,
      required: true
    },

    unit: {
      type: String,
      required: true
    },

    timepoint: {
      label: {
        type: String,
        required: true
      },

      phase: {
        type: String,
        enum: ["pre", "inflight", "post"],
        required: true
      },

      day: {
        type: Number,
        required: true
      },

      order: {
        type: Number,
        required: true
      }
    },

    value: {
      type: Number,
      required: true
    },

    refMin: {
      type: Number,
      default: null
    },

    refMax: {
      type: Number,
      default: null
    },

    source: {
      type: String,
      default: "dataset"
    }
  },
  { timestamps: true }
);

// Baseline
const baselineSchema = new Schema(
  {
    astronautId: {
      type: String,
      required: true
    },

    panel: {
      type: String,
      enum: ["CBC", "CMP"],
      required: true
    },

    analyte: {
      type: String,
      required: true
    },

    unit: {
      type: String,
      required: true
    },

    value: {
      type: Number,
      required: true
    },

    method: {
      type: String,
      default: "personalized_dataset"
    },

    refMin: {
      type: Number,
      default: null
    },

    refMax: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes
measurementSchema.index(
  {
    astronautId: 1,
    panel: 1,
    analyte: 1,
    "timepoint.label": 1
  },
  { unique: true }
);

measurementSchema.index({
  astronautId: 1,
  "timepoint.order": 1
});

baselineSchema.index(
  {
    astronautId: 1,
    panel: 1,
    analyte: 1
  },
  { unique: true }
);

module.exports = {
  Astronaut: mongoose.model("Astronaut", astronautSchema),
  Measurement: mongoose.model("Measurement", measurementSchema),
  Baseline: mongoose.model("Baseline", baselineSchema)
};
