require("dotenv").config();

const astronautRoutes = require("./routes/astronaut");
const baselineRoutes = require("./routes/baseline");
const measurementRoutes = require("./routes/measurment");
const dashboardRoutes = require("./routes/dashboard");
const aiRoutes = require("./routes/aiRoutes");


const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(express.json());
app.use(cors());

// Request Logger
app.use((req, res, next) => {
  console.log("REQUEST RECEIVED:", req.method, req.url);
  next();
});

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "Astronaut Health API is Running",
  });
});

app.use("/api/astronauts", astronautRoutes);
app.use("/api/astronauts", baselineRoutes);
app.use("/api/astronauts", measurementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);


// Error Handler
app.use((error, req, res, next) => {
  console.error(error);

  const status = error.statusCode || 500;

  res.status(status).json({
    message: error.message || "Internal Server Error",
    data: error.data || null,
  });
});

// Connect DB then start app
async function startApp() {
  try {
    await connectDB();

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exit(1);
  }
}

startApp();
