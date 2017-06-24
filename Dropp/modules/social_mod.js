/**
 * social_mod - @module for requests and connections between users
 */

const LOG = require('./log_mod');
const FIREBASE = require('./firebase_mod');

/**
 * getConnections - Retrieves a user's connections (followers or follows)
 * @param {String} _username the requested username
 * @param {String} _connectionsType the type of connection (followers or follows)
 * @param {callback} _callback the callback to return the result
 * @param {callback} _errorCallback the callback to return any errors
 * @throws an error if _connectionsType is not 'followers' or 'follows'
 */
var getConnections = function(_username, _connectionsType, _callback, _errorCallback) {
  const SOURCE = 'getConnections()';
  log(SOURCE);

  if (_connectionsType !== 'followers' && _connectionsType !== 'follows') {
    throw `connectionsType must be 'followers' or 'follows', not '${_connectionsType}'`;
  } else {
    // Retrieve connections
    FIREBASE.GET(
      `/users/${_username}/${_connectionsType}`,
      connections => _callback(connections === null ? {} : connections),
      getConnectionsError => _errorCallback(getConnectionsError)
    );
  }
};

/**
 * getRequests - Retrieves a user's requests (follower or follows)
 * @param {String} _requestsType the type of request (follower or follows)
 * @param {String} _client the requesting client's username
 * @param {callback} _callback the callback to return the result
 * @param {callback} _errorCallback the callback to return any errors
 * @throws an error if _requestsType is not 'follower' or 'follows'
 */
var getRequests = function(_requestsType, _client, _callback, _errorCallback) {
  const SOURCE = 'getRequests()';
  log(SOURCE);

  if (_requestsType !== 'follower' && _requestsType !== 'follow') {
    throw `requestsType must be 'follower' or 'follow', not '${_requestsType}'`;
  } else {
    // Retrieve requests
    FIREBASE.GET(
      `/users/${_client}/${_requestsType}_requests`,
      requests => _callback(requests === null ? {} : requests),
      getRequestsError => _errorCallback(getRequestsError)
    );
  }
};

/**
 * addConnection - Connects two users, allowing one to follow
 * the other. The requester will have the recipient in their
 * follows. The recipient will have the requester in the followers
 * @param {String} _recipient the recipient who accepted the follower request
 * @param {String} _requester the user who sent the follow request
 * @param {callback} _callback the callback to return the result
 * @param {callback} _errorCallback the callback to return any errors
 */
var addConnection = function(_recipient, _requester, _callback, _errorCallback) {
  const SOURCE = 'addConnection()';
  log(SOURCE);

  // Add the requester to the recipient's followers
  FIREBASE.UPDATE(
    `/users/${_recipient}/followers/${_requester}`,
    _requester,
    (newFollower) => {
      // Now add the recipient to the requester's follows
      FIREBASE.UPDATE(
        `/users/${_requester}/follows/${_recipient}`,
        _recipient,
        newFollow => _callback(),
        (addFollowError) => {
          /**
           * Failed while trying to add the recipient to the requester's follows.
           * Remove the requester from the recipient's followers to maintain consistency
           */
          FIREBASE.DELETE(
            `/users/${_recipient}/followers/${_requester}`,
            () => _errorCallback(addFollowError),
            (deleteFollowerError) => {
              // Failed while removing follower from recipient's followers
              log(`${SOURCE}: Failed removing '${_requester}' from '${_recipient}'s followers`);
              _errorCallback(deleteFollowerError);
            }
          );
        }
      );
    },
    addFollowerError => _errorCallback(addFollowerError)
  );
};

/**
 * removeRequest - Removes a pending request from one user to another.
 * This could be a follower request or a follow request. Regardless
 * of the type, the request will be removed from both user's requests
 * @param {String} _userA the user who is initiating the removal
 * @param {String} _requestTypeA the type of request that _userA is removing
 * @param {String} _userB the other user associated with the request
 * @param {String} _requestTypeB the opposite of _requestTypeA
 * @param {callback} _callback the callback to return the result
 * @param {callback} _errorCallback the callback to return any errors
 */
var removeRequest = function(_userA, _requestTypeA, _userB, _requestTypeB, _callback, _errorCallback) {
  const SOURCE = 'removeRequest()';
  log(SOURCE);

  // Remove request from user A
  FIREBASE.DELETE(
    `/users/${_userA}/${_requestTypeA}_requests/${_userB}`,
    () => {
      FIREBASE.DELETE(
        `/users/${_userB}/${_requestTypeB}_requests/${_userA}`,
        () => _callback(),
        removeUserBRequestError => _errorCallback(removeUserBRequestError)
      );
    },
    removeUserARequestError => _errorCallback(removeUserARequestError)
  );
};

/**
 * removeConnection - Removes a connection from one user to another.
 * This could be a follower or a follow. Regardless of the type,
 * the connection will be removed from both user's connections
 * @param {String} _userA the user who is initiating the removal
 * @param {String} _connectionTypeA the type of connection that _userA is removing
 * @param {String} _userB the other user associated with the connection
 * @param {String} _connectionTypeB the opposite of _connectionTypeA
 * @param {callback} _callback the callback to return the result
 * @param {callback} _errorCallback the callback to return any errors
 */
var removeConnection = function(
  _userA,
  _connectionTypeA,
  _userB,
  _connectionTypeB,
  _callback,
  _errorCallback
) {
  const SOURCE = 'removeConnection()';
  log(SOURCE);

  // Remove connection from user A
  FIREBASE.DELETE(
    `/users/${_userA}/${_connectionTypeA}/${_userB}`,
    () => {
      FIREBASE.DELETE(
        `/users/${_userB}/${_connectionTypeB}/${_userA}`,
        () => _callback(),
        (removeUserBConnectionError) => {
          // Failed while removing user B's connection for user A
          log(`${SOURCE}: Failed removing '${_userA}' from '${_userB}'s ${_connectionTypeB.toUpperCase()}`);
          _errorCallback(removeUserBConnectionError);
        }
      );
    },
    removeUserAConnectionError => _errorCallback(removeUserAConnectionError)
  );
};

module.exports = {
  getConnections: getConnections,
  getRequests: getRequests,
  addConnection: addConnection,
  removeRequest: removeRequest,
  removeConnection: removeConnection,
};

/**
 * log - Logs a message to the server console
 * @param {String} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message, _request) {
  LOG.log('Social Module', _message, _request);
}
