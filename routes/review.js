const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authrole");

// ✅ **Create a Review (Only Logged-in Users)**
router.post("/add", authenticateToken, authorizeRoles("user"), async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: req.user.id, product });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }

    // Create review
    const newReview = new Review({
      user: req.user.id,
      product,
      rating,
      comment,
    });

    await newReview.save();

    // Update product rating and review count
    const reviews = await Review.find({ product });
    const avgRating = reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(product, {
      averageRating: avgRating.toFixed(1),
      numReviews: reviews.length,
    });

    res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:productId", async (req, res) => {
    const { productId } = req.params;
    try {
      const reviews = await Review.find({ productId });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });


// ✅ **Get All Reviews for a Product**
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "firstName lastName") // Populate user details
      .sort({ createdAt: -1 }); // Sort by newest first

    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this product." });
    }

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ **Delete a Review (Only Admin or Review Owner)**
router.delete("/:reviewId", authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Check if user is review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
