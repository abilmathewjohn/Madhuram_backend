const ActivityLog = require("../models/ActivityLog");

const logActivity = async (req, res, next) => {
  try {
    if (!req.user) return next(); // Ensure user is logged in

    const log = new ActivityLog({
      user: req.user.id,
      role: req.user.role,
      action: req.method + " " + req.originalUrl, // Example: "POST /orders/create"
      details: req.body || {}, // Store request data
    });

    await log.save();
  } catch (error) {
    console.error("Logging error:", error);
  }

  next();
};

module.exports = logActivity;
