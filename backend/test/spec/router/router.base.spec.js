const Request = require('request');
const Log = require('../../logger');
const Server = require('../../../index');

const baseUrl = `http://localhost:${Server.port}`;
const baseApiRouteTitle = 'Base API route';
/* eslint-disable no-undef */
describe(baseApiRouteTitle, () => {
  it('gets the welcome message and returns status code 200', (done) => {
    Request.get(baseUrl, (error, response, body) => {
      expect(error).toBeNull();
      expect(response).toBeDefined();
      expect(response.statusCode).toBe(200);
      Log(baseApiRouteTitle, body);
      done();
    });
  });
});
/* eslint-enable no-undef */
