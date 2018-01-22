const Request = require('request');
const Log = require('../logger_mod');
const Server = require('../../index');

const baseUrl = `http://localhost:${Server.port}`;

/* eslint-disable no-undef */
describe('Start server', () => {
  const start = Date.now();

  const baseApiRouteTitle = 'Base API route';
  describe(baseApiRouteTitle, () => {
    it('gets the welcome message and returns status code 200', (done) => {
      Request.get(baseUrl, (error, response, body) => {
        expect(error).toBe(null);
        expect(response).toBeDefined();
        expect(response).toBe(200);
        Log(baseApiRouteTitle, body);
        done();
      });
    });
  });

  const shutdownServerTitle = 'Shutdown server';
  describe(shutdownServerTitle, () => {
    it('shuts down the server', (done) => {
      Server.shutdown();
      const end = Date.now();
      Log('Test duration', `${(end - start) / 1000} seconds`);
      done();
    });
  });
});
/* eslint-enable no-undef */
