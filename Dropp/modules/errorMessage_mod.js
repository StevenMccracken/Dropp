/**
 * errorMessage_mod - Standardized error messages @module
 */

const errors = require('./error_mod.js');

/**
 * exports - Provides default verbose messages for given error types
 * @param {string} errorType a standard error type
 * @returns {string} a formal error message
 */
module.exports = function(errorType, opts) {
  var errorMessage;
  switch (errorType) {
    case errors.API_ERROR:
			errorMessage = 'There was a problem with our back-end services';
			break;
  	case errors.AUTHENTICATION_ERROR:
			errorMessage = 'There was an error while authenticating';
			break;
  	case errors.INVALID_REQUEST_ERROR:
      if (typeof opts === "string") {
        errorMessage = 'Your ' + opts + ' parameter is invalid';
      } else {
        errorMessage = 'One of your request parameters is invalid';
      }

			break;
  	case errors.LOGIN_ERROR:
			errorMessage = 'The username or password is incorrect';
			break;
  	case errors.RESOURCE_DNE_ERROR:
			errorMessage = 'That resource does not exist';
			break;
  	case errors.RESOURCE_ERROR:
			errorMessage = 'There was an error accessing that resource';
			break;
    default:
			errorMessage = 'An unknown error occured';
  }

  return errorMessage;
};
