const Log = require('../../logger');
const Request = require('request');
const Server = require('../../../index');

const baseUrl = `http://localhost:${Server.port}`;

/* eslint-disable no-undef */
const baseApiRouteTitle = 'Base API route';
describe(baseApiRouteTitle, () => {
  it('gets the welcome message and returns status code 200', (done) => {
    Request.get(baseUrl, (error, response, body) => {
      expect(error).toBe(null);
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(200);
      Log(baseApiRouteTitle, body);
      done();
    });
  });
});
/* eslint-enable no-undef */
