const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authrole");

// Apply Coupon
router.post("/apply", authenticateToken, async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true, validFrom: { $lte: new Date() }, validUntil: { $gte: new Date() } });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    if (totalAmount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (totalAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({ message: "Coupon applied successfully", discount });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Create Coupon (Admin Only)
router.post("/create", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, validFrom, validUntil } = req.body;

    const newCoupon = new Coupon({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
    });

    await newCoupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get All Coupons (Admin Only)
router.get("/all", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Delete Coupon (Admin Only)
router.delete("/delete/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) return res.status(404).json({ message: "Coupon not found" });

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;