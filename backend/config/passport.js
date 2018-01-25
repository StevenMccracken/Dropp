/**
 * Passport authentication configuration
 */

const JwtConfig = require('./jwt');
const PassportJwt = require('passport-jwt');
// const Util = require('../src/utilities/utils');

const JwtStrategy = PassportJwt.Strategy;
const JwtExtract = PassportJwt.ExtractJwt;

const passport = function passport(_passport = {}) {
  // JSON containing criteria used to compare incoming JWTs to existing JwtStrategy
  const options = {
    secretOrKey: JwtConfig.secret,
    jwtFromRequest: JwtExtract.fromAuthHeaderAsBearerToken(),
  };

  // TODO: Implement the strategy
  const strategy = new JwtStrategy(options, (payload, done) => {
    // Try to retrieve the user corresponding to the identifier in the payload
    // const user = payload._doc.username;
    done(null, null);
    // Check if user exists in the database
    // USERS.getByUsername(username, false)
    //   .then((userInfo) => {
    //     if (UTIL.hasValue(userInfo)) done(null, userInfo);
    //     else {
    //       // The user was not found in the database
    //       console.log('Local user %s not found while authenticating', username);
    //       done(null, null);
    //     }
    //   }) // End then(userInfo)
    //   .catch(getUserError => done(getUserError, null)); // End USERS.getByUsername()
  });

  _passport.use(strategy);
};

module.exports = passport;
