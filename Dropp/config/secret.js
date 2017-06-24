/**
 * secret - JSON web token secret configuration
 */

const Uuidv4 = require('uuid/v4');

// secret is a random UUID string for the seed of web token authentication
module.exports = {
  secret: Uuidv4(),
};
