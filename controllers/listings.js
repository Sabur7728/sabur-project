
const Listing = require("../models/listing");

// ====================== INDEX ======================

module.exports.index = async (req, res) => {
    const search = req.query.search?.trim() || "";

    let allListings = [];

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// ====================== SHOW ======================

module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing You Requested does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// ====================== CREATE ======================

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    // Mapbox removed: save listing without geocoding.
    const savedListing = await newListing.save();

    console.log(savedListing);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// ====================== EDIT ======================

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing You Requested does not exist!");
        return res.redirect("/listings");
    }

    const orignaleImageUrl = listing.image?.url
        ? listing.image.url.replace("/upload", "/upload/h_300,w_250")
        : "";

    res.render("listings/edit.ejs", {
        listing,
        orignaleImageUrl
    });
};

// ====================== UPDATE ======================

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing You Requested does not exist!");
        return res.redirect("/listings");
    }

    if (
        !res.locals.currUser ||
        !listing.owner.equals(res.locals.currUser._id)
    ) {
        req.flash("error", "You don't have permission to edit.");
        return res.redirect(`/listings/${id}`);
    }

    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.country = req.body.listing.country;
    listing.location = req.body.listing.location;

    // Mapbox removed: update listing without geocoding.

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// ====================== DELETE ======================

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
