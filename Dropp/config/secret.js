/**
 * secret - JSON web token secret @module
 */

const uuidV4 = require('uuid/v4');

module.exports = {
  // A random UUID string for the seed of our web token authentication
  'secret': uuidV4(),
};
