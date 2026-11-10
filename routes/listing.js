// ====================== IMPORTS ======================
// IMPORT EXPRESS → Used to create routes
const express = require("express");

// CREATE ROUTER → Handles all listing-related routes
const router = express.Router();

// IMPORT WRAPASYNC → Handles errors from async functions
const wrapAsync = require("../utils/wrapAsync.js");

// IMPORT LISTING MODEL → Used to work with listing data
const Listing = require("../models/listing.js");

// IMPORT MIDDLEWARE → Authentication, ownership & validation checks
const {
  isLoggedIn,
  isOwner,
  validateListing
} = require("../authMiddleware");

// =============== IMP ====== CONTROLLERS =========
// IMPORT CONTROLLER → Contains the actual route logic
const listingController = require("../controllers/listings.js");

// npm package that helps us to upload files
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// ====================== ROUTES ======================

router
  .route("/")
  // INDEX → GET /listings → Show all listings
  .get(wrapAsync(listingController.index))
  // CREATE → POST /listings → Create new listing
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing),
  );


// NEW → GET /listings/new → Show create listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  // SHOW → GET /listings/:id → Show one listing
  .get(wrapAsync(listingController.showListing))
  // UPDATE → PUT /listings/:id → Update listing
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  // DELETE → DELETE /listings/:id → Delete listing
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// EDIT → GET /listings/:id/edit → Show edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);
// ====================== EXPORT ======================

// EXPORT ROUTER → Used in app.js
module.exports = router;
