const Utils = require('../utilities/utils');
const DroppError = require('../errors/DroppError');
const Validator = require('../utilities/validator');

/**
 * Model object for a user
 * @extends Object
 */
class User extends Object {
  constructor(_details = {}) {
    super();

    if (!Utils.hasValue(_details)) throw new DroppError();

    const invalidMembers = [];
    if (!Validator.isValidEmail(_details.email)) invalidMembers.push('email');
    if (!Validator.isValidUsername(_details.username)) invalidMembers.push('username');

    if (invalidMembers.length > 0) throw new DroppError({ invalidMembers });

    this.email = _details.email;
    this.username = _details.username;
    this.follows = [];
    this.followers = [];
    this.followRequests = [];
    this.followerRequests = [];
    if (Utils.hasValue(_details.follows)) {
      Object.entries(_details.follows).forEach(([, value]) => {
        this.follows.push(value);
      });
    }

    if (Utils.hasValue(_details.followers)) {
      Object.entries(_details.followers).forEach(([, value]) => {
        this.followers.push(value);
      });
    }

    if (Utils.hasValue(_details.follow_requests)) {
      Object.entries(_details.follow_requests).forEach(([, value]) => {
        this.followRequests.push(value);
      });
    }

    if (Utils.hasValue(_details.follower_requests)) {
      Object.entries(_details.follower_requests).forEach(([, value]) => {
        this.followerRequests.push(value);
      });
    }
  }

  get username() {
    return this._username;
  }

  get email() {
    return this._email;
  }

  get follows() {
    return this._follows;
  }

  get followers() {
    return this._followers;
  }

  get followRequests() {
    return this._followRequests;
  }

  get followerRequests() {
    return this._followerRequests;
  }

  set username(_username) {
    this._username = _username;
  }

  set email(_email) {
    this._email = _email;
  }

  set follows(_follows) {
    this._follows = _follows;
  }

  set followers(_followers) {
    this._followers = _followers;
  }

  set followRequests(_requests) {
    this._followRequests = _requests;
  }

  set followerRequests(_requests) {
    this._followerRequests = _requests;
  }

  get data() {
    const data = {
      email: this._email,
    };

    if (this._follows.length > 0) {
      this._follows.forEach((follow) => {
        data.follows[follow] = follow;
      });
    }

    if (this._followers.length > 0) {
      this._followers.forEach((follower) => {
        data.followers[follower] = follower;
      });
    }

    if (this._followRequests.length > 0) {
      this._follows.forEach((follow) => {
        data.follow_requests[follow] = follow;
      });
    }

    if (this._followerRequests.length > 0) {
      this._follows.forEach((follow) => {
        data.follower_requests[follow] = follow;
      });
    }

    return data;
  }
}

module.exports = User;
