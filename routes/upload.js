const express = require("express");
const upload = require("../middleware/multer");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authrole");
const Image = require("../models/Image");

const router = express.Router();

// Upload image (Admin or Employee)
router.post("/", authenticateToken, authorizeRoles("admin", "employee"), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (!req.body.type) return res.status(400).json({ message: "Image type is required" });

    const newImage = new Image({
      imageUrl: req.file.path,
      type: req.body.type, // Save the image type (e.g., banner, offer, profile)
      uploadedBy: req.user.id, // ID of the user or employee
      userType: req.user.role === "admin" ? "User" : "Employee", // Determine user type
    });

    await newImage.save();
    res.status(201).json({ message: "Image uploaded successfully", image: newImage });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Fetch a random banner image
router.get("/banner/random", async (req, res) => {
  try {
    const bannerImages = await Image.find({ type: "banner" }); // Fetch all banner images
    if (!bannerImages.length) {
      return res.status(404).json({ message: "No banner images found" });
    }

    // Select a random banner image
    const randomIndex = Math.floor(Math.random() * bannerImages.length);
    const randomBanner = bannerImages[randomIndex];

    // Replace backslashes with forward slashes in the image URL
    const imageUrl = randomBanner.imageUrl.replace(/\\/g, '/');

    // Return the full URL for the image
    res.status(200).json({ imageUrl: `http://localhost:3000/${imageUrl}` });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;