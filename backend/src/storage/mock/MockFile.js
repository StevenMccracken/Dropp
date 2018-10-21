const Utils = require('../../utilities/utils');
const StreamBuffers = require('stream-buffers');

class MockFile extends Object {
  // path: string;
  // contents: Buffer;
  // metadata: Object;

  constructor(_path) {
    super();
    if (typeof _path !== 'string') throw new Error('invalid path');
    this.path = _path;
    this.metadata = {};
    this.doesExist = false;
    this.contents = Buffer.alloc(0);
  }

  get doesExist() {
    return this._doesExist;
  }

  set doesExist(_doesExist) {
    this._doesExist = _doesExist;
  }

  get() {
    return [this, this.metadata];
  }

  setMetadata(_metadata) {
    if (!Utils.hasValue(_metadata)) throw new Error('invalid metadata');
    const customMetadata = {
      ...this.metadata.metadata,
      ..._metadata.metadata,
    };

    this.metadata = {
      ...this.metadata,
      ..._metadata,
      metadata: customMetadata,
    };
  }

  createReadStream() {
    const readable = new StreamBuffers.ReadableStreamBuffer();
    readable.put(this.contents);
    readable.stop();
    return readable;
  }

  createWriteStream(metadata) {
    this.setMetadata(metadata);
    const writable = new StreamBuffers.WritableStreamBuffer();
    writable.on('finish', () => {
      this.doesExist = true;
      this.contents = writable.getContents();
    });

    return writable;
  }

  exists() {
    const promise = new Promise((resolve) => {
      resolve([this.doesExist]);
    });

    return promise;
  }

  delete() {
    const promise = new Promise((resolve) => {
      this.doesExist = false;
      resolve();
    });

    return promise;
  }
}

module.exports = MockFile;
