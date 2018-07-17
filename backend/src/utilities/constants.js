/**
 * @module for constant values
 */

// parameters
const params = {
  id: 'id',
  user: 'user',
  User: 'User',
  text: 'text',
  true: 'true',
  false: 'false',
  media: 'media',
  dropp: 'dropp',
  Dropp: 'Dropp',
  email: 'email',
  folder: 'folder',
  denial: 'denial',
  accept: 'accept',
  follow: 'follow',
  string: 'string',
  newText: 'newText',
  newEmail: 'newEmail',
  fileName: 'fileName',
  filePath: 'filePath',
  follower: 'follower',
  username: 'username',
  password: 'password',
  location: 'location',
  Location: 'Location',
  latitude: 'latitude',
  longitude: 'longitude',
  fileNames: 'fileNames',
  timestamp: 'timestamp',
  requestId: 'requestId',
  base64Data: 'base64Data',
  acceptance: 'acceptance',
  oldPassword: 'oldPassword',
  newPassword: 'newPassword',
  requestedUser: 'requestedUser',
};

// errors
const errors = {
  types: {
    unknown: 'unknown',
    /* eslint-disable quote-props */
    'constructor': 'constructor',
    /* eslint-enable quote-props */
    typeMismatch: 'type_mismatch',
    invalidState: 'invalid_state',
  },
  messages: {
    unknown: 'Unknown error',
    detaisArgNoValue: 'details arg has no value',
    unknownErrorOccurred: 'An unknown error occurred',
    noUserForToken: 'User for this token cannot be found',
    unexpectedType: 'Given model was not of the expected type',
    invalidConstrucutorData: 'Invalid data given to the constructor',
    newValueMustBeDifferent: 'New value must be different than existing value',
  },
  objectIsNot: _type => `Object is not a ${_type}`,
  database: {
    moduleName: 'Database Error',
    name: 'DatabaseError',
  },
  dropp: {
    moduleName: 'Dropp Error',
    name: 'DroppError',
  },
  model: {
    moduleName: 'Model Error',
    name: 'ModelError',
  },
  storage: {
    moduleName: 'Storage Error',
    name: 'StorageError',
  },
};

// authentication
const auth = {
  moduleName: 'Authentication Module',
  saltIterations: 5,
  expirationTime: '7d',
};

const passport = {
  moduleName: 'Passport Module',
  jwt: 'jwt',
  Bearer: 'Bearer',
};

// database
const database = {
  dropp: {
    moduleName: 'Dropp Accessor',
    baseUrl: '/dropps',
    forbiddenDroppId: '-Kjsh',
  },
  user: {
    moduleName: 'User Accessor',
    baseUrls: {
      users: '/users',
      passwords: '/passwords',
    },
    forbiddenDroppId: '-Kjsh',
  },
  error: {
    moduleName: 'Error Accessor',
    baseUrl: '/errorLogs',
  },
};

// firebase
const firebase = {
  moduleName: 'Firebase Accessor',
  value: 'value',
  projectUrl: 'https://dropp-3a65d.firebaseio.com',
};

// media
const media = {
  moduleName: 'Media Module',
  mimeTypes: {
    png: 'image/png',
    jpeg: 'image/jpeg',
    unknown: 'unknown',
  },
  base64DataTypes: {
    png: 'iVBORw0KGgoAAA',
    jpg: '/9j/4AAQSkZJRg',
  },
  encodings: {
    hex: 'hex',
    base64: 'base64',
  },
};

// middleware
const middleware = {
  messages: {
    mustFollowUser: 'You must follow that user',
    unauthorizedAccess: 'Unauthorized to access that',
  },
  dropp: {
    moduleName: 'Dropp Middleware',
    maxDistanceMeters: 1000,
    cloudStorageFolder: 'dropps/',
    messages: {
      errors: {
        noMedia: 'This dropp does not contain media',
        invalidMediaType: 'Media must be PNG or JPG',
        mustContainText: 'This dropp must contain non-empty text',
        cannotHaveMedia: 'This dropp cannot have media added to it',
        mediaAlreadyAdded: 'Media has already been added to this dropp',
      },
      success: {
        addMedia: 'Successful media creation',
        textUpdate: 'Successful text update',
        removeDropp: 'Successful dropp removal',
        createDropp: 'Successful dropp creation',
      },
    },
  },
  user: {
    moduleName: 'User Middleware',
    messages: {
      errors: {
        doNotFollowUser: 'You do not follow that user',
        cannotUnfollowSelf: 'You cannot unfollow yourself',
        userDoesNotFollowYou: 'That user does not follow you',
        cannotRequestFollowSelf: 'You cannot request to follow yourself',
        usernameAlreadyExists: 'A user with that username already exists',
        noFollowRequestFromUser: 'That user has not requested to follow you',
        cannotRemoveFollowerSelf: 'You cannot remove yourself as a follower',
        oldPasswordMustMatchExisting: 'Old password must match existing password',
        cannotRemoveFollowSelf: 'You cannot remove a follow request from yourself',
        noPendingFollowRequest: 'You do not have a pending follow request for that user',
        alreadyHasFollowRequest: 'You already have a pending follow request for that user',
        cannotRespondRequestSelf: 'You cannot respond to a follower request from yourself',
      },
      success: {
        unfollow: 'Successful unfollow',
        createUser: 'Successful user creation',
        emailUpdate: 'Successful email update',
        followRequest: 'Successful follow request',
        authentication: 'Successful authentication',
        passwordUpdate: 'Successful password update',
        remove: 'Successfully removed all user data',
        removeFollower: 'Successful follower removal',
        followRequestRemoval: 'Successful follow request removal',
        followRequestResponse: response => `Successful follow request ${response}`,
      },
    },
  },
};

// models
const models = {
  dropp: {
  },
  location: {
    earthRadiusMeters: 6371e3,
  },
  user: {
  },
};

// router
const router = {
  moduleName: 'Router Module',
  xForwardedFor: 'x-forwarded-for',
  accessControlExposeHeaders: 'Access-Control-Expose-Headers',
  messages: {
    errors: {
      unknownCatch: 'An unknown was caught in router',
    },
    success: {
      welcome: 'This is the REST API for Dropp',
    },
  },
  routes: {
    base: '/',
    welcome: '/welcome',
    auth: '/auth',
    users: {
      base: '/users',
      username: {
        base: '/users/:username',
        email: '/users/:username/email',
        password: '/users/:username/password',
        dropps: '/users/:username/dropps',
        follows: {
          dropps: '/users/:username/follows/dropps',
          follow: '/users/:username/follows/:follow',
          requests: {
            base: '/users/:username/follows/requests',
            requestedUser: '/users/:username/follows/requests/:requestedUser',
          },
        },
        followers: {
          follower: '/users/:username/followers/:follower',
          requests: {
            requestedUser: '/users/:username/followers/requests/:requestedUser',
          },
        },
      },
    },
    dropps: {
      base: '/dropps',
      dropp: {
        base: '/dropps/:id',
        text: '/dropps/:id/text',
        media: '/dropps/:id/media',
      },
    },
  },
  details: {
    '/': 'GET',
    '/welcome': 'GET',
    '/auth': 'POST',
    '/users': {
      '/': 'POST',
      '/<username>': {
        '/': [
          'GET',
          'DELETE',
        ],
        '/email': 'PUT',
        '/password': 'PUT',
        '/dropps': 'GET',
        '/follows': {
          '/dropps': 'GET',
          '/<follow>': 'DELETE',
          '/requests': {
            '/': 'POST',
            '/<requestedUser>': 'DELETE',
          },
        },
        '/followers': {
          '/<follower>': 'DELETE',
          '/requests': {
            '/<requestedUser>': 'PUT',
          },
        },
      },
    },
    '/dropps': {
      '/': [
        'GET',
        'POST',
      ],
      '/<dropp>': {
        '/': [
          'GET',
          'DELETE',
        ],
        '/text': 'PUT',
        '/media': 'POST',
      },
    },
  },
};

// storage
const storage = {
  moduleName: 'Cloud Storage Accessor',
  project: {
    id: 'dropp-3a65d',
    url: 'dropp-3a65d.appspot.com',
    accountKeyPath: './config/secrets/storageAccountKey.json', // relative to process CWD
  },
  folders: {
    uploads: 'cache/uploads',
    downloads: 'cache/downloads',
  },
  streamEvents: {
    end: 'end',
    data: 'data',
    error: 'error',
    finish: 'finish',
  },
  messages: {
    pipingStreams: 'Piping streams',
    creatingLocalStream: 'Creating local stream',
    creatingRemoteStream: 'Creating remote stream',
    configuringStorageFile: 'Configuring storage file',
    removingRemoteFile: 'Deleting remote file from bucket',
    errors: {
      fileAlreadyExists: 'That file already exists',
      uploadError: 'Encountered an error while uploading local file to cloud storage',
    },
    success: {
      finishedUpload: 'Finished uploading local file to cloud storage',
    },
  },
};

// utils
const utils = {
  moduleName: 'Utils',
  emptyString: '',
  degress180: 180,
  unixEndTimeSeconds: 2147471999,
  unixEndTimeMilliseconds: 2147471999000,
};

module.exports = {
  params,
  errors,
  auth,
  passport,
  database,
  firebase,
  media,
  middleware,
  models,
  router,
  storage,
  utils,
};
