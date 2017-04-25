var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt  = require('passport-jwt').ExtractJwt,
    firebase    = require('../modules/firebase_mod.js');
    config      = require('../config/secret');

module.exports = function(passport) {
  var options = {};
  options.secretOrKey = config.secret;
  options.jwtFromRequest = ExtractJwt.fromAuthHeader();

  passport.use(new JwtStrategy(options, function(jwt_payload, done) {
    firebase.getUser(jwt_payload.username, response => {
      if (response['error'] != null) {
        return done(response, false);
      }

      if (response) {
        response['username'] = jwt_payload.username;
        done(null, response);
      } else {
        console.log('%s not found while authenticating with JWT strategy', jwt_payload.username);
        done(null, null);
      }
    });
  }));
};
