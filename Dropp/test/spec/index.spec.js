
var request = require("request");
var server = require("../../server.js");
var base_url = "http://localhost/"
// port 80 require sudo accesss, in order for the test to be done on travis, we have to user other port
// Server will check for TEST env variable and adjust the port according to environment

if(process.env.TEST){
	base_url = "http://localhost:3000/"
}

describe("Server", function(){
	describe("GET /", function(){
		it("returns status code 200", function(done){
			request.get(base_url, function(error, response, body){
				expect(response.statusCode).toBe(200);
				done();
			})
		})

		it("returns Hello World", function(done){
			request.get(base_url, function(error, response, body){
				expect(body).toBe('{"message":"This is the REST API for Dropp"}');
				
				done();
			})
		})

	})

	describe('Authenticate', function() {

        var params = null;
        beforeEach(function() {
            params = {
                url: base_url + "authenticate",
                form: {
                    username: 'rich',
                    password: '1234',
                    email: 'test@gmail.com',
                }
            };
        });

        it('returns a 200 OK on valid user', function(done) {
            request.post(params, function(err, resp, body) {
                var data = JSON.parse(body);
                // expect(resp.statusCode).toEqual(200);
                expect(data.success.token).toBeDefined();
                server.closeServer();
                done();
            });
        });
    });
})