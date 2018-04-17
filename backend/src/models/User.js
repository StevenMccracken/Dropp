const Utils = require('../utilities/utils');
const ModelError = require('../errors/ModelError');
const Validator = require('../utilities/validator');

/**
 * Model object for a user
 * @extends Object
 */
class User extends Object {
  constructor(_details = {}) {
    super();

    if (!Utils.hasValue(_details)) {
      ModelError.throwConstructorError('User', 'details arg has no value');
    }

    const invalidMembers = [];
    if (!Validator.isValidEmail(_details.email)) invalidMembers.push('email');
    if (!Validator.isValidUsername(_details.username)) invalidMembers.push('username');
    if (invalidMembers.length > 0) {
      ModelError.throwInvalidMemebersError('Dropp', invalidMembers);
    }

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
      follows: {},
      followers: {},
      follow_requests: {},
      follower_requests: {},
    };

    if (Utils.hasValue(this._follows) && this._follows.length > 0) {
      this._follows.forEach((follow) => {
        data.follows[follow] = follow;
      });
    }

    if (Utils.hasValue(this._followers) && this._followers.length > 0) {
      this._followers.forEach((follower) => {
        data.followers[follower] = follower;
      });
    }

    if (Utils.hasValue(this._followRequests) && this._followRequests.length > 0) {
      this._followRequests.forEach((follow) => {
        data.follow_requests[follow] = follow;
      });
    }

    if (Utils.hasValue(this._followerRequests) && this._followerRequests.length > 0) {
      this._followerRequests.forEach((follow) => {
        data.follower_requests[follow] = follow;
      });
    }

    return data;
  }

  get privateData() {
    const data = {
      follows: {},
      followers: {},
      followsCount: 0,
      followerCount: 0,
      email: this._email,
      followRequests: {},
      followerRequests: {},
      followRequestCount: 0,
      followerRequestCount: 0,
      username: this._username,
    };

    if (Utils.hasValue(this._follows) && this._follows.length > 0) {
      this._follows.forEach((follow) => {
        data.followsCount++;
        data.follows[follow] = follow;
      });
    }

    if (Utils.hasValue(this._followers) && this._followers.length > 0) {
      this._followers.forEach((follower) => {
        data.followerCount++;
        data.followers[follower] = follower;
      });
    }

    if (Utils.hasValue(this._followRequests) && this._followRequests.length > 0) {
      this._followRequests.forEach((follow) => {
        data.followRequestCount++;
        data.followRequests[follow] = follow;
      });
    }

    if (Utils.hasValue(this._followerRequests) && this._followerRequests.length > 0) {
      this._followerRequests.forEach((follow) => {
        data.followerRequestCount++;
        data.followerRequests[follow] = follow;
      });
    }

    return data;
  }

  get publicData() {
    const data = this.privateData;
    delete data.email;
    delete data.followRequests;
    delete data.followerRequests;
    delete data.followRequestCount;
    delete data.followerRequestCount;

    return data;
  }

  doesFollow(_username) {
    return this._follows.includes(_username);
  }

  hasFollower(_username) {
    return this._followers.includes(_username);
  }

  hasFollowRequest(_username) {
    return this._followRequests.includes(_username);
  }

  hasFollowerRequest(_username) {
    return this._followerRequests.includes(_username);
  }
}

module.exports = User;
