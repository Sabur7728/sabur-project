// ====================== IMPORTS ======================

// IMPORT EXPRESS → Used to create routes
const express = require("express");

// CREATE ROUTER → Handles user authentication routes
const router = express.Router();

// IMPORT USER MODEL → Used for user database operations
const User = require("../models/user.js");

// IMPORT WRAPASYNC → Handles errors from async functions
const wrapAsync = require("../utils/wrapAsync.js");

// IMPORT PASSPORT → Used for user authentication
const passport = require("passport");

// IMPORT MIDDLEWARE → Saves the URL user originally wanted to visit
const { saveRedirectUrl } = require("../authMiddleware.js");

// IMPORT CONTROLLER → Contains the actual user-related logic
const userController = require("../controllers/users.js");

// IMPORT USER MODEL
const user = require("../models/user.js");

// ====================== USER ROUTES ======================

router
  .route("/signup")
  // SIGNUP FORM → GET /signup → Display signup page
  .get(userController.renderSignupForm)
  // SIGNUP → POST /signup → Register a new user
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  // LOGIN FORM → GET /login → Display login page
  .get(userController.renderloginForm)
  // LOGIN → POST /login → Authenticate existing user
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login,
  );

// LOGOUT → GET /logout → Log the user out
router.get("/logout", userController.logout);

// ====================== EXPORT ======================

// EXPORT ROUTER → Used in app.js
module.exports = router;
