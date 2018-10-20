/**
 * @module for mocking cloud storage
 */

const MockBucket = require('./MockBucket');
const Utils = require('../../utilities/utils');

class MockStorage extends Object {
  // buckets: {[name: string]: MockBucket};

  constructor() {
    super();
    this.buckets = {};
  }

  bucket(_name) {
    if (!Utils.hasValue(_name)) throw new Error('invalid name');
    let bucket = this.buckets[_name];
    if (Utils.hasValue(bucket)) return bucket;

    bucket = new MockBucket(_name);
    this.buckets[_name] = bucket;
    return bucket;
  }
}

module.exports = MockStorage;
