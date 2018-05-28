const Location = require('./Location');
const Utils = require('../utilities/utils');
const ModelError = require('../errors/ModelError');
const Validator = require('../utilities/validator');

/**
 * Model object for a dropp
 * @extends Object
 */
class Dropp extends Object {
  constructor(_details) {
    super();
    if (!Utils.hasValue(_details)) {
      ModelError.throwConstructorError('Dropp', 'details arg has no value');
    }

    const invalidMembers = [];
    if (!(_details.location instanceof Location)) invalidMembers.push('location');
    if (!Validator.isValidTimestamp(_details.timestamp)) invalidMembers.push('timestamp');
    if (!Validator.isValidUsername(_details.username)) invalidMembers.push('username');
    if (!Validator.isValidTextPost(_details.text)) invalidMembers.push('text');
    if (!Validator.isValidBooleanString(_details.media)) invalidMembers.push('media');
    if (invalidMembers.length > 0) ModelError.throwInvalidMembersError('Dropp', invalidMembers);
    this.id = _details.id;
    this.location = _details.location;
    this.media = _details.media;
    this.text = _details.text;
    this.timestamp = _details.timestamp;
    this.username = _details.username;
  }

  get id() {
    return this._id;
  }

  get location() {
    return this._location;
  }

  get media() {
    return this._media;
  }

  get text() {
    return this._text;
  }

  get timestamp() {
    return this._timestamp;
  }

  get username() {
    return this._username;
  }

  set id(_id) {
    this._id = _id;
  }

  set location(_location) {
    this._location = _location;
  }

  set media(_media) {
    this._media = _media;
  }

  set text(_text) {
    this._text = _text;
  }

  set timestamp(_timestamp) {
    this._timestamp = _timestamp;
  }

  set username(_username) {
    this._username = _username;
  }

  get databaseData() {
    return {
      text: this._text,
      media: this._media,
      location: this._location,
      username: this._username,
      timestamp: this._timestamp,
    };
  }

  get publicData() {
    return {
      id: this._id,
      text: this._text,
      media: this._media,
      location: this._location,
      username: this._username,
      timestamp: this._timestamp,
    };
  }
}

module.exports = Dropp;
