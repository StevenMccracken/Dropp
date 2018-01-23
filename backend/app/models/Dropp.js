const Utils = require('../utilities/utils');
const DroppError = require('../errors/DroppError');

class Dropp extends Object {
  constructor(_details = {}) {
    super();
    if (!Utils.hasValue(_details)) throw new DroppError();

    this.id = _details.id;
    this.location = _details.location;
    this.media = _details.media;
    this.text = _details.text;
    this.timestamp = _details.timestamp;
    this.username = _details.username;
  }
}

module.exports = Dropp;
