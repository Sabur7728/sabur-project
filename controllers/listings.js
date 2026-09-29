// IMPORT LISTING MODEL → Used to perform database operations
const Listing = require("../models/listing");
//mapbox geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// ====================== INDEX ======================

// GET /listings → Display all listings
module.exports.index = async (req, res) => {
    const search = req.query.search?.trim() || "";

    let allListings = [];

    if (search) {
        // Escape special regex characters
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // "new york" -> new\s*york
        // "newyork"  -> newyork
        const flexibleSearch = escapedSearch
            .split(/\s+/)
            .join("\\s*");

        const regex = new RegExp(flexibleSearch, "i");

        allListings = await Listing.find({
            $or: [
                { title: regex },
                { location: regex },
                { country: regex },
                { description: regex }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", {
        allListings,
        search
    });
};
// ====================== NEW ======================

// GET /listings/new → Display new listing form
module.exports.renderNewForm = (req, res) => {
  // RENDER NEW FORM
  res.render("listings/new.ejs");
};

// ====================== SHOW ======================

// GET /listings/:id → Display one listing
module.exports.showListing = async (req, res) => {
  // GET ID → Extract listing ID from URL
  let { id } = req.params;

  // FIND LISTING → Find listing and populate reviews & owner
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  // CHECK LISTING → If listing doesn't exist
  if (!listing) {
    // SHOW ERROR MESSAGE
    req.flash("error", "Listing You Requested does not exists!");

    // REDIRECT TO LISTINGS
    return res.redirect("/listings");
  }

  // RENDER SHOW PAGE
  res.render("listings/show.ejs", { listing });
};

// ====================== CREATE ======================

// POST /listings → Create a new listing
module.exports.createListing = async (req, res) => {
  // geocoding
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();


  let url = req.file.path;
  let filename = req.file.name;
  // CREATE LISTING → Get listing data from form
  const newListing = new Listing(req.body.listing);

  // SET OWNER → Assign logged-in user as owner
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;
  // SAVE LISTING → Store listing in MongoDB
  let savedListing = await newListing.save();
  console.log(savedListing);

  // SUCCESS MESSAGE
  req.flash("success", "New Listing Created!");

  // REDIRECT TO LISTINGS
  res.redirect("/listings");
};

// ====================== EDIT ======================

// GET /listings/:id/edit → Display edit form
module.exports.renderEditForm = async (req, res) => {
  // GET ID → Extract listing ID
  let { id } = req.params;

  // FIND LISTING
  const listing = await Listing.findById(id);

  // CHECK LISTING → Handle invalid/deleted listing
  if (!listing) {
    // SHOW ERROR MESSAGE
    req.flash("error", "Listing You Requested does not exists!");

    // REDIRECT TO LISTINGS
    return res.redirect("/listings");
  }
  let orignaleImageUrl = listing.image.url;
  orignaleImageUrl.replace("/upload", "/upload/h_300,w_250");
  // RENDER EDIT FORM
  res.render("listings/edit.ejs", { listing, orignaleImageUrl });
};

// ====================== UPDATE ======================

// ====================== UPDATE ======================
// ====================== UPDATE ======================

// PUT /listings/:id → Update listing
module.exports.updateListing = async (req, res) => {
  // GET ID → Extract listing ID
  let { id } = req.params;

  // FIND EXISTING LISTING
  let listing = await Listing.findById(id);

  // CHECK LISTING
  if (!listing) {
    req.flash("error", "Listing You Requested does not exist!");
    return res.redirect("/listings");
  }

  // CHECK OWNER
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You Don't have permission to edit");
    return res.redirect(`/listings/${id}`);
  }

  // ======================
  // GEOCODE NEW LOCATION
  // ======================

  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  // Check if Mapbox found the location
  if (!response.body.features.length) {
    req.flash("error", "Location not found!");
    return res.redirect(`/listings/${id}/edit`);
  }

  // Get new coordinates
  let newGeometry = response.body.features[0].geometry;

  // ======================
  // UPDATE LISTING DATA
  // ======================

  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.country = req.body.listing.country;
  listing.location = req.body.listing.location;

  // IMPORTANT:
  // Update geometry with NEW location coordinates
  listing.geometry = newGeometry;

  // ======================
  // UPDATE IMAGE IF PROVIDED
  // ======================

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = {
      url: url,
      filename: filename,
    };
  }

  // SAVE EVERYTHING
  await listing.save();

  // SUCCESS MESSAGE
  req.flash("success", "Listing Updated!");

  // REDIRECT
  res.redirect(`/listings/${id}`);
};


// ====================== DELETE ======================

// DELETE /listings/:id → Delete listing
module.exports.destroyListing = async (req, res) => {
  // GET ID → Extract listing ID
  let { id } = req.params;

  // DELETE LISTING → Remove listing from MongoDB
  let deletedListing = await Listing.findByIdAndDelete(id);

  // SUCCESS MESSAGE
  req.flash("success", "Listing Deleted!");

  // REDIRECT TO LISTINGS
  res.redirect("/listings");
};
