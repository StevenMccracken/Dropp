/**
 * passport - Passport authentication configuration @module
 */

const config      = require('../config/secret');
const firebase    = require('../modules/firebase_mod.js');
const ExtractJwt  = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;

/**
 * exports - Defines how to generate and validate JSON web tokens
 * @param {Object} passport a passport object, usually from 'require(passport)'
 */
module.exports = function(passport) {
  // JSON containing criteria used to compare incoming JWTs to existing JWTs
  var options = {};
  options.secretOrKey = config.secret;
  options.jwtFromRequest = ExtractJwt.fromAuthHeader();

  /**
   * Use this strategy to compare JWTs from HTTP requests
   * to existing JWTs saved in passport's local memory
   */
  passport.use(new JwtStrategy(options, function(jwt_payload, done) {
    // Try to retrieve the user corresponding to the username in the payload
    firebase.getUser(jwt_payload.username, response => {
      // If there was an error retrieving the user, return the error with the callback
      if (response['error'] != null) {
        return done(response, false);
      }

      /**
       * If the database response is not null and doesn't contain
       * the key 'error', the user was found and the token is valid.
       * Send the all of that user's information to the callback
       */
      if (response) {
        /**
         * Add the username key,value pair because database
         * record does not contain that information
         */
        response['username'] = jwt_payload.username;
        done(null, response);
      } else {
        /**
         * The user was not found in the database so
         * return a null error and user with the callback
         */
        console.log('%s not found while authenticating with JWT strategy', jwt_payload.username);
        done(null, null);
      }
    });
  }));
};
