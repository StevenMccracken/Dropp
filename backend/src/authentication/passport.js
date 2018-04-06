/**
 * @module for token authentication using Passport
 */

const PassportJwt = require('passport-jwt');
const JwtConfig = require('../../config/jwt');
const UserAccessor = require('../database/user');

const JwtStrategy = PassportJwt.Strategy;
const JwtExtract = PassportJwt.ExtractJwt;

const passport = function passport(_passport = {}) {
  // JSON containing criteria used to compare incoming JWTs to existing JwtStrategy
  const options = {
    secretOrKey: JwtConfig.secret,
    jwtFromRequest: JwtExtract.fromAuthHeaderAsBearerToken(),
  };

  const strategy = new JwtStrategy(options, async (payload, done) => {
    // Try to retrieve the user corresponding to the identifier in the payload
    try {
      const user = await UserAccessor.get(payload.username);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  _passport.use(strategy);
};

module.exports = passport;