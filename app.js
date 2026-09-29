// ====================== IMPORTS ======================
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

// Import Express framework
const express = require("express");

// Create an Express application instance
const app = express();

// Import Mongoose for MongoDB connection & models
const mongoose = require("mongoose");

// Import Listing model
const Listing = require("./models/listing.js");

// Node.js path module to handle file paths
const path = require("path");

// Allows using PUT & DELETE methods from HTML forms
const methodOverride = require("method-override");

// EJS layout engine
const ejsMate = require("ejs-mate");

// Utility to handle async errors
const wrapAsync = require("./utils/wrapAsync.js");

// Custom error class
const ExpressError = require("./utils/ExpressError.js");

// Joi schemas for server-side validation
const { listingSchema, reviewShema } = require("./schema.js");

// Review model
const Review = require("./models/review.js");

// Import route files
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Session middleware
const session = require("express-session");

// Fixed MongoStore import for connect-mongo v4+
const { MongoStore } = require("connect-mongo");

// Flash middleware
const flash = require("connect-flash");

// Passport authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");

// User model
const User = require("./models/user.js");

// ====================== DATABASE SETUP ======================

// MongoDB connection URL
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;

// Connect to MongoDB
main()
  .then(() => {
    console.log("✅ connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// Async function to establish DB connection
async function main() {
  await mongoose.connect(dbUrl);
}

// ====================== EXPRESS CONFIGURATION ======================

// Set EJS as template engine
app.set("view engine", "ejs");

// Set path for views folder
app.set("views", path.join(__dirname, "views"));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Enable PUT & DELETE requests using ?_method
app.use(methodOverride("_method"));

// Use ejs-mate for layouts & partials
app.engine("ejs", ejsMate);

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "/public")));

app.use((req, res, next) => {
  res.locals.mapToken = process.env.MAP_TOKEN;
  next();
});

// ====================== SESSION SETUP ======================
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("❌ Mongo Session Store Error:", err);
});

const sessionOptions = {
    store: store,
    secret: process.env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

app.use(session(sessionOptions));

// ====================== FLASH SETUP ======================

// Enable flash middleware
app.use(flash());

// ====================== PASSPORT SETUP ======================

// Initialize Passport
app.use(passport.initialize());

// Enable Passport sessions
app.use(passport.session());

// LocalStrategy → Checks username/password using User.authenticate()
passport.use(new LocalStrategy(User.authenticate()));

// Serialize user → Stores user ID in session
passport.serializeUser(User.serializeUser());

// Deserialize user → Retrieves user from session
passport.deserializeUser(User.deserializeUser());

// ====================== GLOBAL LOCALS ======================

// Make flash messages and current user available in all EJS files
app.use((req, res, next) => {
  res.locals.success = req.flash("success") || [];
  res.locals.error = req.flash("error") || [];

  // Current logged-in user
  res.locals.currUser = req.user;

  next();
});

// ====================== LISTING ROUTES ======================

// All listing routes
app.use("/listings", listingRouter);

// ====================== REVIEW ROUTES ======================

// Nested review routes
app.use("/listings/:id/reviews", reviewRouter);

// ====================== USER ROUTES ======================

// Signup, Login, Logout routes
app.use("/", userRouter);

// ====================== ERROR HANDLING ======================

// Catch-all route for undefined pages
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// ====================== GLOBAL ERROR HANDLER ======================

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;

  res.status(statusCode).render("error.ejs", { message });
});

// ====================== SERVER ======================

// Start the server
app.listen(8080, () => {
  console.log("🚀 server is listening on port 8080");
});