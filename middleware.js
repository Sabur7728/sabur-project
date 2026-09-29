const Listing = require("./models/listing");


const Review = require("./models/review");


// Custom error class for sending errors with status codes
const ExpressError = require("./utils/ExpressError.js");

// Joi validation schemas for listings and reviews
const { listingSchema, reviewShema } = require("./schema.js");

// Check whether user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Save the page user wanted to visit before login
    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "You Must be Logged in to Create a Listing!");

    // Send user to login page
    return res.redirect("/login");
  }

  // User is logged in, so continue
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  // Get the saved URL and make it available to the route
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }

  // Continue to the next middleware
  next();
};      


// Check whether the logged-in user owns the listing
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;

  // Find the listing using its ID
  let listing = await Listing.findById(id);

  // Compare listing owner with current user
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to do that");

    // Stop here if user is not the owner
    return res.redirect(`/listings/${id}`);
  }

  // User is the owner, so continue
  next();
};




// Validate listing data before saving it
module.exports.validateListing = (req, res, next) => {
  // Check form data using Joi schema
  let { error } = listingSchema.validate(req.body);

  // If validation fails, stop the request
  if (error) {
    // Get all validation errors in readable form
    let errMsg = error.details.map((el) => el.message).join(",");

    // Send validation error with 400 status
    throw new ExpressError(400, errMsg);
  }

  // Data is valid, so continue
  next();
};




// Validate review data before saving it
module.exports.validateReview = (req, res, next) => {
  // Check review data using Joi schema
  let { error } = reviewShema.validate(req.body);

  // Stop the request if review data is invalid
  if (error) {
    // Convert validation errors into a readable message
    let errMsg = error.details.map(el => el.message).join(",");
    
    // Send validation error with 400 status
    throw new ExpressError(400, errMsg);
  }

  // Review is valid, so continue
  next();
};





// Check whether the logged-in user owns the review to delete there own review 
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;

  // Find the listing using its ID
  let review = await Review.findById(reviewId);

  // Compare listing owner with current user
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of the Review to delete this Review :) ");

    // Stop here if user is not the owner
    return res.redirect(`/listings/${id}`);
  }

  // User is the owner, so continue
  next();
}; 