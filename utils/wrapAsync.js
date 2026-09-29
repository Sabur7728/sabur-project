// This module exports a function that helps handle errors
// in asynchronous (async/await) Express route handlers
module.exports = (fn) => {

  // The returned function is an Express middleware
  // It receives req, res, and next like any route handler
  return (req, res, next) => {

    // Execute the async function (fn)
    // If an error occurs (Promise rejection),
    // it is automatically passed to Express's error handler
    fn(req, res, next).catch(next);
  };
};
