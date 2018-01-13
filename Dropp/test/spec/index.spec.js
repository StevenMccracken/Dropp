const FS = require('fs');
const SERVER = require('../../server.js');
const Uuidv4 = require('uuid/v4');
const REQUEST = require('request');
const FormData = require('form-data');

// Server will check for TEST env variable and adjust the port according to the environment
let baseUrl = 'http://localhost:8080';
if (process.env.TEST) baseUrl = 'http://localhost:3000';

describe('Start server', () => {
  let start = Date.now();

  let baseApiRoute = 'Base API route';
  describe(baseApiRoute, () => {
    it('gets the welcome message and returns status code 200', (done) => {
      REQUEST.get(baseUrl, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(baseApiRoute, body);
        done();
      });
    });
  }); // End base API route

  // Test user information
  let user1Name = 'grunttest_' + Uuidv4(), user2Name = 'grunttest_' + Uuidv4();
  let password = 'password';
  let user1Token, user2Token;

  // Create the first test user
  let createUser1 = 'Create user 1';
  describe(createUser1, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/users`,
        form: {
          username: user1Name,
          password: password,
          email: `${user1Name}@grunttest.com`,
        },
      };
    });

    it('creates a new user and returns status code 201', (done) => {
      REQUEST.post(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(201);
        log(createUser1, body);

        // Parse JSON response for the token
        let data = JSON.parse(body);
        expect(data.success.token).toBeDefined();
        user1Token = data.success.token;
        done();
      });
    });
  }); // End create user 1

  // Create the second test user
  let createUser2 = 'Create user 2';
  describe(createUser2, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/users`,
        form: {
          username: user2Name,
          password: password,
          email: `${user2Name}@grunttest.com`,
        },
      };
    });

    it('creates a new user and returns status code 201', (done) => {
      REQUEST.post(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(201);
        log(createUser2, body);

        // Parse JSON response for the token
        let data = JSON.parse(body);
        expect(data.success.token).toBeDefined();
        user2Token = data.success.token;
        done();
      });
    });
  }); // End create user 2

  // Authenticate credentials to get a token
  let authenticate = 'Authenticate';
  describe(authenticate, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/authenticate`,
        form: {
          username: user1Name,
          password: password,
        },
      };
    });

    it('generates a token and returns status code 200', (done) => {
      REQUEST.post(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(authenticate, body);

        // Parse JSON response for the token
        let data = JSON.parse(body);
        expect(data.success.token).toBeDefined();
        done();
      });
    });
  }); // End authenticate

  // Get user 1's information
  let getUser1Info = 'Get user 1\'s information';
  describe(getUser1Info, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/users/${user1Name}`,
        headers: { Authorization: user1Token },
      };
    });

    it('gets user\'s information and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(getUser1Info, body);
        done();
      });
    });
  }); // End get user 1's information

  // Update user 1's email
  let updateUser1Email = 'Update user 1\'s email';
  describe(updateUser1Email, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/users/${user1Name}/email`,
        headers: { Authorization: user1Token },
        form: { 'new-email': `${user1Name}_updated@grunttest.com` },
      };
    });

    it('updates user\'s email and returns status code 200', (done) => {
      REQUEST.put(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(updateUser1Email, body);
        done();
      });
    });
  }); // End update user 1's email

  // Update user 1's password
  let updateUser1Password = 'Update user 1\'s password';
  describe(updateUser1Password, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/users/${user1Name}/password`,
        headers: { Authorization: user1Token },
        form: {
          'old-password': password,
          'new-password': `${password}_updated`,
        },
      };
    });

    it('updates user\'s password and returns status code 200', (done) => {
      REQUEST.put(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(updateUser1Password, body);
        done();
      });
    });
  }); // End update user 1's password

  // Create dropp with no image
  let droppNoImageKey;
  let createDroppNoImage = 'Create dropp without image';
  describe(createDroppNoImage, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/dropps`,
        headers: { Authorization: user1Token },
        form: {
          location: '0,0',
          timestamp: Math.floor(Date.now() / 1000),
          text: 'grunt test',
          media: 'false',
        },
      };
    });

    it('creates a new dropp and returns status code 201', (done) => {
      REQUEST.post(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(201);
        log(createDroppNoImage, body);

        // Parse JSON response for the dropp id key
        let data = JSON.parse(body);
        expect(data.droppId).toBeDefined();
        droppNoImageKey = data.droppId;
        done();
      });
    });
  }); // End create a dropp with no image

  // Create dropp with image
  let droppWithImageKey;
  let createDroppWithImage = 'Create dropp with image';
  describe(createDroppWithImage, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/dropps`,
        headers: { Authorization: user1Token },
        form: {
          location: '0,0',
          timestamp: Math.floor(Date.now() / 1000),
          text: 'grunt test with image',
          media: 'true',
        },
      };
    });

    it('creates a new dropp and returns status code 201', (done) => {
      REQUEST.post(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(201);
        log(createDroppWithImage, body);

        // Parse JSON response for the dropp id key
        let data = JSON.parse(body);
        expect(data.droppId).toBeDefined();
        droppWithImageKey = data.droppId;
        done();
      });
    });
  }); // End create dropp with image

  // Upload image
  let uploadImage = 'Upload image';
  describe(uploadImage, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/dropps/${droppWithImageKey}/image`,
        headers: { Authorization: user1Token },
        formData: { image: FS.createReadStream('./test/spec/test.png') },
      };
    });

    it('uploads an image and returns status code 200', (done) => {
      REQUEST.post(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(201);
        log(uploadImage, body);
        done();
      });
    });
  }); // End upload image

  // Get dropp with image
  let getDroppWithImage = 'Get dropp with image';
  describe(getDroppWithImage, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/dropps/${droppWithImageKey}`,
        headers: { Authorization: user1Token },
      };
    });

    it('gets the dropp and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(getDroppWithImage, body);
        done();
      });
    });
  }); // End get dropp with image

  // Download image
  let downloadImage = 'Download image';
  describe(downloadImage, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/dropps/${droppWithImageKey}/image`,
        headers: {
          Authorization: user1Token,
          platform: 'React-Native',
        },
      };
    });

    it('downloads the image and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);

        let imageMetadata = body.split(',', 1);
        log(downloadImage, `Image metadata: ${imageMetadata}`);
        done();
      });
    });
  }); // End download image

  // Get all dropps around user 1 and posted by user 1's follows
  let getAllDropps = 'Get all dropps';
  describe(getAllDropps, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/dropps`,
        headers: {
          location: '0,0',
          'max-distance': 100,
          Authorization: user1Token,
        },
      };
    });

    it('gets all the dropps and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);

        // Parse JSON response for the dropps
        let data = JSON.parse(body);
        log(getAllDropps, `Count: ${Object.keys(data).length}`);
        done();
      });
    });
  }); // End get all dropps around user 1 and posted by user 1's follows

  // Get dropps around user 1's location
  let getDroppsAroundUser1 = 'Get dropps around location';
  describe(getDroppsAroundUser1, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/location/dropps`,
        headers: {
          location: '0,0',
          'max-distance': 100,
          Authorization: user1Token
        },
      };
    });

    it('gets the dropps around location and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);

        // Parse JSON response for the dropps
        let data = JSON.parse(body);
        expect(data.count).toBeDefined();
        log(getDroppsAroundUser1, `Count: ${data.count}`);
        done();
      });
    });
  }); // End get dropps around user 1's location

  // Get dropps posted by user 1
  let getDroppsByUser = 'Get dropps by user';
  describe(getDroppsByUser, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/users/${user1Name}/dropps`,
        headers: { Authorization: user1Token },
      };
    });

    it('gets the dropps by user and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);

        // Parse JSON response for the dropps
        let data = JSON.parse(body);
        log(getDroppsByUser, `Count: ${Object.keys(data).length}`);
        done();
      });
    });
  }); // End get dropps posted by user 1

  // Update dropp text
  let updateDroppWithImageText = 'Update dropp text';
  describe(updateDroppWithImageText, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/dropps/${droppWithImageKey}/text`,
        headers: { Authorization: user1Token },
        form: { 'new-text': 'grunt test update dropp' },
      };
    });

    it('updates the dropp text and returns status code 200', (done) => {
      REQUEST.put(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(updateDroppWithImageText, body);
        done();
      });
    });
  }); // End update dropp text

  // Delete dropp with image
  let deleteDroppWithImage = 'Delete dropp with image';
  describe(deleteDroppWithImage, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/dropps/${droppWithImageKey}`,
        headers: { Authorization: user1Token },
      };
    });

    it('deletes the dropp and returns status code 200', (done) => {
      REQUEST.delete(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(deleteDroppWithImage, body);
        done();
      });
    });
  }); // End delete dropp with image

  // Send follow request from user 1 to user 2
  let requestToFollowUser2 = 'Request to follow user 2';
  describe(requestToFollowUser2, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/requests/follows/${user2Name}`,
        headers: { Authorization: user1Token },
      };
    });

    it('sends the follow request and returns status code 200', (done) => {
      REQUEST.post(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(requestToFollowUser2, body);
        done();
      });
    });
  }); // End send follow request from user 1 to user 2

  // Send follow request from user 2 to user 1
  let requestToFollowUser1 = 'Request to follow user 1';
  describe(requestToFollowUser1, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/requests/follows/${user1Name}`,
        headers: { Authorization: user2Token },
      };
    });

    it('sends the follow request and returns status code 200', (done) => {
      REQUEST.post(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(requestToFollowUser1, body);
        done();
      });
    });
  }); // End send follow request from user 2 to user 1

  // Get user 1's follow requests
  let getFollowRequests = 'Get follow requests';
  describe(getFollowRequests, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/requests/follows`,
        headers: { Authorization: user1Token },
      };
    });

    it('gets the follow requests and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);

        // Parse JSON response for the follow requests
        let data = JSON.parse(body);
        log(getFollowRequests, `Count: ${Object.keys(data).length}`);
        done();
      });
    });
  }); // End get user 1's follow requests

  // Get user 1's follower requests
  let getFollowerRequests = 'Get follower requests';
  describe(getFollowerRequests, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/requests/followers`,
        headers: { Authorization: user1Token },
      };
    });

    it('gets the follower requests and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);

        // Parse JSON response for the follow requests
        let data = JSON.parse(body);
        log(getFollowerRequests, `Count: ${Object.keys(data).length}`);
        done();
      });
    });
  }); // End get user 1's follower requests

  // Accept user 1's follower request
  let acceptFollowerRequest = 'Accept follower request';
  describe(acceptFollowerRequest, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/requests/followers/${user2Name}`,
        headers: { Authorization: user1Token },
      };
    });

    it('accepts the follower request and returns status code 200', (done) => {
      REQUEST.put(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(acceptFollowerRequest, body);
        done();
      });
    });
  }); // End accept user 1's follower request

  // Decline user 2's follower request
  let declineFollowerRequest = 'Decline follower request';
  describe(declineFollowerRequest, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/requests/followers/${user1Name}`,
        headers: { Authorization: user2Token },
      };
    });

    it('declines the follower request and returns status code 200', (done) => {
      REQUEST.delete(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(declineFollowerRequest, body);
        done();
      });
    });
  }); // End decline user 2's follower request

  // Get user 1's followers
  let getFollowers = 'Get followers';
  describe(getFollowers, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/users/${user1Name}/followers`,
        headers: { Authorization: user2Token },
      };
    });

    it('gets the followers and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);

        // Parse JSON response for the followers
        let data = JSON.parse(body);
        log(getFollowers, `Count: ${Object.keys(data).length}`);
        done();
      });
    });
  }); // End get user 1's followers

  // Get user 2's follows
  let getFollows = 'Get follows';
  describe(getFollows, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/users/${user2Name}/follows`,
        headers: { Authorization: user1Token },
      };
    });

    it('gets the follows and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);

        // Parse JSON response for the follows
        let data = JSON.parse(body);
        log(getFollows, `Count: ${Object.keys(data).length}`);
        done();
      });
    });
  }); // End get user 2's follows

  // Get dropps posted by user 2's follows
  let getDroppsByFollows = 'Get dropps by follows';
  describe(getDroppsByFollows, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/follows/dropps`,
        headers: { Authorization: user2Token },
      };
    });

    it('gets the dropps by follows and returns status code 200', (done) => {
      REQUEST.get(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);

        // Parse JSON response for the dropps
        let data = JSON.parse(body);
        log(getDroppsByFollows, `Count: ${Object.keys(data).length}`);
        done();
      });
    });
  }); // End get dropps posted by user 2's follows

  // Send follow request from user 1 to user 2 again
  let requestToFollowUser2Again = 'Request to follow user 2 again';
  describe(requestToFollowUser2Again, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/requests/follows/${user2Name}`,
        headers: { Authorization: user1Token },
      };
    });

    it('sends the follow request and returns status code 200', (done) => {
      REQUEST.post(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(requestToFollowUser2Again, body);
        done();
      });
    });
  }); // End send follow request from user 1 to user 2 again

  // Remove pending follow request from user 1 to user 2
  let removeFollowRequest = 'Remove follow request';
  describe(removeFollowRequest, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/requests/follows/${user2Name}`,
        headers: { Authorization: user1Token },
      };
    });

    it('removes the follow request and returns status code 200', (done) => {
      REQUEST.delete(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(removeFollowRequest, body);
        done();
      });
    });
  }); // End remove pending follow request from user 1 to user 2

  // Remove user 1's follower
  let removeFollower = 'Remove follower';
  describe(removeFollower, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/followers/${user2Name}`,
        headers: { Authorization: user1Token },
      };
    });

    it('removes the follower and returns status code 200', (done) => {
      REQUEST.delete(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(removeFollower, body);
        done();
      });
    });
  }); // End remove user 1's follower

  // Send follow request from user 2 to user 1 again
  let requestToFollowUser1Again = 'Request to follow user 1 again';
  describe(requestToFollowUser1Again, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/requests/follows/${user1Name}`,
        headers: { Authorization: user2Token },
      };
    });

    it('sends the follow request and returns status code 200', (done) => {
      REQUEST.post(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(requestToFollowUser1Again, body);
        done();
      });
    });
  }); // End send follow request from user 2 to user 1 again

  // Accept user 1's follower request again
  let acceptFollowerRequestAgain = 'Accept follower request';
  describe(acceptFollowerRequestAgain, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/requests/followers/${user2Name}`,
        headers: { Authorization: user1Token },
      };
    });

    it('accepts the follower request and returns status code 200', (done) => {
      REQUEST.put(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(acceptFollowerRequestAgain, body);
        done();
      });
    });
  }); // End accept user 1's follower request again

  // User 2 unfollows user 1
  let unfollow = 'Unfollow';
  describe(unfollow, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/follows/${user1Name}`,
        headers: { Authorization: user2Token },
      };
    });

    it('unfollows the user and returns status code 200', (done) => {
      REQUEST.delete(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(unfollow, body);
        done();
      });
    });
  }); // End user 2 unfollows user 1

  // Delete user 1
  let deleteUser1 = 'Delete user';
  describe(deleteUser1, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/users/${user1Name}`,
        headers: { Authorization: user1Token },
      };
    });

    it('deletes the user and returns status code 200', (done) => {
      REQUEST.delete(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(deleteUser1, body);
        done();
      });
    });
  }); // End delete user 1

  // Delete user 2
  let deleteUser2 = 'Delete user';
  describe(deleteUser2, () => {
    let requestParams;
    beforeEach(() => {
      requestParams = {
        url: `${baseUrl}/users/${user2Name}`,
        headers: { Authorization: user2Token },
      };
    });

    it('deletes the user and returns status code 200', (done) => {
      REQUEST.delete(requestParams, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        log(deleteUser2, body);
        done();
      });
    });
  }); // End delete user 2

  // Close the server
  let closeServer = 'Close server';
  describe(closeServer, () => {
    it('shuts down the test server', (done) => {
      SERVER.closeServer();
      log(closeServer, 'closed');
      log('Test duration', `${(Date.now() - start) / 1000} seconds`);
      done();
    });
  }); // End close the server
}); // End start server

/**
 * log - Logs testing messages to the console
 * @param {String} _spec the test specification
 * @param {String} _message a result of the test
 */
function log(_spec, _message) {
  if (_message === undefined) console.log('GRUNT (%s)', _spec);
  else console.log('GRUNT (%s): %s', _spec, _message);
}
