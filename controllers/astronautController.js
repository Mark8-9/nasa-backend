const { Astronaut } = require("../models/Index");

exports.getAllAstronauts = async (req, res, next) => {
  try {
    const astronauts = await Astronaut.find();

    res.status(200).json({
      message: "Astronauts fetched successfully",
      data: astronauts,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAstronautById = async (req, res, next) => {
  try {
    const { astronautId } = req.params;

    const astronaut = await Astronaut.findOne({ astronautId });

    if (!astronaut) {
      return res.status(404).json({
        message: "Astronaut not found",
      });
    }

    res.status(200).json({
      message: "Astronaut fetched successfully",
      data: astronaut,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAstronautSummary = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "Summary endpoint is ready",
    });
  } catch (error) {
    next(error);
  }
};