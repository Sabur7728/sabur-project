const mongoose = require("mongoose"); // Import mongoose for MongoDB connection
const initData = require("./data.js"); // Import initial data (sample listings)
const Listing = require("../models/listing.js"); // Import Listing model

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; // MongoDB connection URL

// Connect to MongoDB
main()
  .then(() => {
    console.log("connected to DB"); // Log success if connected
  })
  .catch((err) => {
    console.log(err); // Log error if connection fails
  });

async function main() {
  await mongoose.connect(MONGO_URL); // Establish connection to MongoDB
}

// Function to reset and initialize database with sample data
const initDB = async () => {
  await Listing.deleteMany({}); // Delete all existing documents in 'listings' collection

  initData.data = initData.data.map((obj) => ({ ...obj, owner: "6a8dc27a1b4198b6e868f286" }));

  await Listing.insertMany(initData.data); // Insert sample listings from data.js
  console.log("data was initialized"); // Log confirmation
};

initDB(); // Run the database initialization
