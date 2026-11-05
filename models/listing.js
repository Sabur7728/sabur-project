const mongoose = require("mongoose"); // Import mongoose for MongoDB
const review = require("./review");
const Schema = mongoose.Schema; // Create shorthand for mongoose.Schema
const Review = require("./review");

// Define schema for Listing
const listingSchema = new Schema({
  title: {
    type: String, // Title must be a string
    required: true, // Title is required (cannot be empty)
  },
  description: String, // Optional description (string)

  // First image field (string with default URL and setter)
  image: {
    url: String,
    filename: String,
    // type: String, // Image will be stored as a string (URL)
    // default:
    //   "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60", // Default image if none provided
    // set: (v) =>
    //   v === "" // If value is empty string
    //     ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60" // Use default image
    //     : v, // Otherwise use provided value
  },

  // Second image field (object with filename and url)
  image: {
    filename: String, // Filename property (string)
    url: String, // URL property (string)
  },

  price: Number, // Price of listing (number)
  location: String, // Location of listing (string)
  country: String, // Country of listing (string)
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  // geometry: {
  //   type: {
  //     type: String, // Don't do `{ location: { type: String } }`
  //     enum: ["Point"], // 'location.type' must be 'Point'
  //     required: true,
  //   },
  //   coordinates: {
  //     type: [Number],
  //     required: true,
  //   },
  // },
});

// Deleting Review if Our Listing also Deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

// Create model from schema
const Listing = mongoose.model("Listing", listingSchema);

// Export model so it can be used in other files
module.exports = Listing;
