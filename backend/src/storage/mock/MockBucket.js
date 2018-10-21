const MockFile = require('./MockFile');
const Utils = require('../../utilities/utils');

class MockBucket extends Object {
  // name: string;
  // files: {[path: string]: MockFile};

  constructor(_name) {
    super();
    if (typeof _name !== 'string') throw new Error('invalid name');
    this.name = _name;
    this.files = {};
  }

  file(_path) {
    if (typeof _path !== 'string') throw new Error('invalid path');
    let file = this.files[_path];
    if (Utils.hasValue(file)) {
      file.doesExist = true;
      return file;
    }

    file = new MockFile(_path);
    return file;
  }

  addFile(_folder, _name, _file) {
    if (typeof _folder !== 'string') throw new Error('invalid folder');
    if (typeof _name !== 'string') throw new Error('invalid name');
    if (!(_file instanceof MockFile)) throw new Error('invalid file');
    this.files[`${_folder}${_name}`] = _file;
  }

  removeFile(_folder, _name) {
    if (typeof _folder !== 'string') throw new Error('invalid folder');
    if (typeof _name !== 'string') throw new Error('invalid name');
    delete this.files[`${_folder}${_name}`];
  }
}

module.exports = MockBucket;
