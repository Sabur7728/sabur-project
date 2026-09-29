// Custom Error class for handling application-specific errors
// This class extends the built-in JavaScript Error class
class ExpressError extends Error {

    // Constructor runs when a new error is created
    constructor(statusCode, message) {

        // Call the parent Error class constructor
        // This sets up the error stack trace properly
        super();

        // HTTP status code (e.g. 404, 400, 500)
        this.statusCode = statusCode;

        // Error message to display or send to error page
        this.message = message;
    }
};

// Export this class so it can be used in routes and middleware
module.exports = ExpressError;
