/**
 * @module for constant values
 */

const Utils = require('../src/utilities/utils');

// authentication
const auth = {
  testName: 'Authentication Module',
  illegalArguments: 'illegal arguments',
  noAuthToken: 'no auth token',
  errors: {
    unexpectedToken: 'Unexpected token',
    expired: 'jwt expired',
    invalidToken: 'invalid token',
    invalidSignature: 'invalid signature',
    malformed: 'jwt malformed',
    noAuthToken: 'No auth token',
    mustBeProvided: 'jwt must be provided',
  },
};

const database = {
  dropp: {
    testName: 'Dropp Accessor',
  },
  error: {
    testName: 'Error Accessor',
  },
  user: {
    testName: 'User Accessor',
  },
};

const errors = {
  database: {
    testName: 'Database Error',
  },
  dropp: {
    testName: 'Dropp Error',
  },
  model: {
    testName: 'Model Error',
  },
  storage: {
    testName: 'Storage Error',
  },
};

const firebase = {
  testName: 'Firebase',
  mock: {
    testName: 'Mock Firebase',
  },
};

const logging = {
  testName: 'Logger Module',
};

const media = {
  testName: 'Media',
  hex: 'hex',
  doubleEquals: '==',
  hexData: {
    png: '89504e470d0a1a0a0000',
    jpg: 'ffd8ffe000104a464946',
    random: '255044462d312e330a25',
  },
  mimeTypes: {
    directory: 'inode/directory',
  },
  base64DataTypes: {
    test: 'dGVzdA==',
    random: 'JVBERi0xLjMKJQ==',
  },
};

const middleware = {
  dropp: {
    testName: 'Dropp Middleware',
  },
  user: {
    testName: 'User Middleware',
  },
};

const models = {
  dropp: {
    testName: 'Dropp Model',
  },
  location: {
    testName: 'Location Model',
    coordinates: {
      random1: 49.26780455063753,
      random2: 24.84656534821976,
      random3: 12.48046875,
      random4: 2.8125,
    },
    expectedDistance: 2842336.280726291,
  },
  user: {
    testName: 'User Model',
  },
};

const router = {
  testName: 'Router Module',
  url: port => `http://localhost:${port}`,
  routes: {
    auth: 'auth',
  },
  subroutes: {
    anyUsername: '/<username>',
    anyFollow: '/<follow>',
    anyFollower: '/<follower>',
    anyRequestedUser: '/<requestedUser>',
    email: '/email',
    password: '/password',
    follows: '/follows',
    followers: '/followers',
    requests: '/requests',
  },
  methods: {
    get: 'GET',
    put: 'PUT',
    post: 'POST',
    delete: 'DELETE',
  },
  statusCodes: {
    success: 200,
    creation: 201,
  },
};

const storage = {
  testName: 'Cloud Storage',
};

const utils = {
  testName: 'Utility Module',
  strings: {
    tab: '\t',
    newLine: '\n',
    return: '\r',
    emptyString: '',
    paddedEmptyString: '    ',
    javascript: 'console.log(\'hey\')',
    hey: 'hey',
    emoji: '😈',
    stringWithInteger: '1',
    stringWithFloat: '1.1',
    stringWithWhitespaceAndText: '  hey-',
  },
};

const validator = {
  testName: 'Validator Module',
  returns: (input, output) => `${input} returns ${output}`,
};

module.exports = {
  params: {
    test: 'test',
    test2: 'test2',
    value: 'value',
    testId: 'testId',
    defaultLocation: 0,
    defaultTimestamp: 1,
    testAddress: 'testAddress',
    updatedValue: 'updated value',
    trueString: 'true',
    falseString: 'false',
    testEmail: 'test@test.com',
    uuidEmail: () => `${Utils.newUuid()}@${Utils.newUuid()}.com`,
    invalidChars: {
      url: '.$[]',
      dollar: '$',
      percent: '%',
      username: '$%l;kadfjs',
      encodedUsername: '%24%25l%3Bkadfjs',
      password: 'he$',
    },
  },
  messages: {
    shouldHaveThrown: 'Should have thrown error',
    shouldNotHaveThrown: 'Should not have thrown error',
    doesNotExist: value => `That ${value} does not exist`,
    expectedMessage: error => `returns the expected message for error equal to '${error}'`,
  },
  files: {
    image001: 'test_image_001.png',
  },
  auth,
  database,
  errors,
  firebase,
  logging,
  media,
  middleware,
  models,
  router,
  storage,
  utils,
  validator,
};
