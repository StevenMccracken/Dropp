/**
 * JSON web token authentication secret configuration
 */

const Config = require('./secrets/jwt');

module.exports = {
  secret: Config.secret,
};
