/**
 * passport - @module for passport authentication configuration
 */

const CONFIG = require('./secret');
const FIREBASE = require('../modules/firebase_mod.js');
const EXTRACTJWT = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;

/**
 * exports - Defines how to generate and validate JSON web tokens
 * @param {Object} _passport a passport object, usually from 'require(passport)'
 */
module.exports = function(_passport) {
  // JSON containing criteria used to compare incoming JWTs to existing JWTs
  let options = {
    secretOrKey: CONFIG.secret,
    jwtFromRequest: EXTRACTJWT.fromAuthHeader(),
  };

  /**
   * Use this strategy to compare JWTs from HTTP requests
   * to existing JWTs saved in passport's local memory
   */
  _passport.use(new JwtStrategy(options, (jwt_payload, done) => {
    // Try to retrieve the user corresponding to the username in the payload
    FIREBASE.GET(
      `/users/${jwt_payload.username}`,
      (userInfo) => {
        if (userInfo !== null) {
          userInfo.username = jwt_payload.username;
          done(null, userInfo);
        } else {
          // The user was not found in the database
          console.log('%s not found while authenticating with JWT strategy', jwt_payload.username);
          done(null, null);
        }
      },
      getUserError => done(getUserError, false)
    );
  }));
};
