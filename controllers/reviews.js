// IMPORT LISTING MODEL → Used to perform database operations
const Listing = require("../models/listing");

// IMPORT REVIEW MODEL
const Review = require("../models/review");

// ====================== CREATE ======================

module.exports.createReview = async (req, res) => {
  // Find the listing using the ID from URL
  const listing = await Listing.findById(req.params.id);

  // Stop if the listing does not exist
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  // Create review using form data
  const newReview = new Review(req.body.review);

  // new review added with the author
  newReview.author = req.user._id;
  // Add the review to this listing
  listing.reviews.push(newReview);

  // Save review in database
  await newReview.save();

  // Save listing with the new review reference
  await listing.save();

  // Show success message
  req.flash("success", "New Review Created!");

  // Return to listing page
  res.redirect(`/listings/${listing._id}`);
};

// ====================== DELETE ======================

module.exports.destroyReview = async (req, res) => {
  // Get listing ID and review ID from URL
  const { id, reviewId } = req.params;

  // Remove review ID from listing's reviews array
  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  // Delete the review from database
  await Review.findByIdAndDelete(reviewId);

  // Show success message
  req.flash("success", "Review Deleted!");

  // Return to listing page
  res.redirect(`/listings/${id}`);
};
