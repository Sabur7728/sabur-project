
const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");

const {
  listingSchema,
  reviewShema: reviewSchema
} = require("./schema.js");

// Check whether user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }

  next();
};

// Save redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }

  next();
};

// Check listing owner
module.exports.isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      return next(new ExpressError(404, "Listing not found"));
    }

    if (
      !res.locals.currUser ||
      !listing.owner.equals(res.locals.currUser._id)
    ) {
      req.flash("error", "You don't have permission to do that");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (err) {
    next(err);
  }
};

// Validate listing
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details
      .map((el) => el.message)
      .join(", ");

    return next(new ExpressError(400, errMsg));
  }

  next();
};

// Validate review
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errMsg = error.details
      .map((el) => el.message)
      .join(", ");

    return next(new ExpressError(400, errMsg));
  }

  next();
};

// Check review author
module.exports.isReviewAuthor = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return next(new ExpressError(404, "Review not found"));
    }

    if (
      !res.locals.currUser ||
      !review.author.equals(res.locals.currUser._id)
    ) {
      req.flash("error", "You are not authorized to delete this review");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (err) {
    next(err);
  }
};
