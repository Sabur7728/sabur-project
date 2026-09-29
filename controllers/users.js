const User = require("../models/user")

// ====================== SIGNUP ======================

// RENDER SIGNUP FORM → Display signup page
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// SIGNUP → Register a new user
module.exports.signup = async (req, res) => {
  try {
    // GET USER DATA → Extract username, email and password
    let { username, email, password } = req.body;

    // CREATE USER → Create user with username and email
    const newUser = new User({ email, username });

    // REGISTER USER → Save user and securely hash password
    const registeredUser = await User.register(newUser, password);

    console.log(registeredUser);

    // LOGIN USER → Automatically log in after registration
    req.login(registeredUser, (err) => {
      // HANDLE LOGIN ERROR
      if (err) {
        return next(err);
      }

      // SUCCESS MESSAGE
      req.flash("success", "Welcome to Wanderlust");

      // REDIRECT TO LISTINGS
      res.redirect("/listings");
    });
  } catch (e) {
    // ERROR MESSAGE → Show signup error
    req.flash("error", e.message);

    // REDIRECT TO SIGNUP
    res.redirect("/signup");
  }
};

// ====================== LOGIN ======================

// RENDER LOGIN FORM → Display login page
module.exports.renderloginForm = (req, res) => {
  res.render("users/login.ejs");
};

// LOGIN → Handle successful login
module.exports.login = async (req, res) => {
  // SUCCESS MESSAGE
  req.flash("success", "Welcome to Wanderlust, You are Logged in!");

  // GET REDIRECT URL → Return user to originally requested page
  let redirectUrl = res.locals.redirectUrl || "/listings";

  // REDIRECT USER
  res.redirect(redirectUrl);
};

// ====================== LOGOUT ======================

// LOGOUT → Log out the current user
module.exports.logout = (req, res, next) => {
  // PASSPORT LOGOUT → End the user's login session
  req.logout((err) => {
    // HANDLE LOGOUT ERROR
    if (err) {
      return next(err);
    }

    // SUCCESS MESSAGE
    req.flash("success", "You are Logged out!");

    // REDIRECT TO LISTINGS
    res.redirect("/listings");
  });
};
