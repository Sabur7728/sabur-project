// ---------------------- IMPORTS ----------------------

// Express is used to create routes
const express = require("express");

// mergeParams allows this router to get :id from /listings/:id/reviews
const router = express.Router({ mergeParams: true });

// Handles errors from async functions
const wrapAsync = require("../utils/wrapAsync");

// Custom error class for handling errors
const ExpressError = require("../utils/ExpressError");

// Model used to work with reviews in MongoDB
const Review = require("../models/review");

// Model used to work with listings in MongoDB
const Listing = require("../models/listing");

const {
  isLoggedIn,
  isReviewAuthor,
  validateReview
} = require("../authMiddleware");

const reviewController = require("../controllers/reviews.js");
const review = require("../models/review");

// ---------------------- ROUTES ----------------------

// CREATE REVIEW
// POST /listings/:id/reviews
router.post(
  "/",
  isLoggedIn,
  validateReview, // Validate review before saving
  wrapAsync(reviewController.createReview),
);

// DELETE REVIEW
// DELETE /listings/:id/reviews/:reviewId
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview),
);

// ---------------------- EXPORT ROUTER ----------------------

// Export router for use in app.js
module.exports = router;
