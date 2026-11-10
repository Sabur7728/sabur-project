
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");
const {
  saveRedirectUrl
} = require("./authMiddleware.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ================= DATABASE =================

const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SESSION_SECRET;

if (!dbUrl) {
  throw new Error("ATLASDB_URL is missing");
}

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is missing");
}

// Cache MongoDB connection for serverless requests
let dbConnectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!dbConnectionPromise) {
    dbConnectionPromise = mongoose.connect(dbUrl)
      .then(() => {
        console.log(
          "MongoDB connected:",
          mongoose.connection.name
        );
      })
      .catch((err) => {
        dbConnectionPromise = null;
        throw err;
      });
  }

  return dbConnectionPromise;
}; 

// Connect database before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    next(err);
  }
});

// ================= EXPRESS =================

app.set("trust proxy", 1);

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

// ================= SESSION =================

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: sessionSecret,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.error("Session store error:", err);
});

app.use(
  session({
    store,
    name: "wanderlust.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// ================= FLASH =================

app.use(flash());

// ================= PASSPORT =================

app.use(passport.initialize());
app.use(passport.session());
// AUTH MIDDLEWARE
app.use(saveRedirectUrl);


passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL LOCALS =================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// HOME ROUTE
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ================= ROUTES =================

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ================= 404 =================

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "Internal Server Error"
      : err.message || "Something went wrong";

  res.status(statusCode).render("error.ejs", { message });
});

// ================= VERCEL EXPORT =================

// Do not use app.listen() on Vercel
module.exports = app;


// Start local server only when running directly
if (require.main === module) {
  const PORT = process.env.PORT || 8080;

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}