
var request = require("request");
var server = require("../../server.js");
var base_url = "http://localhost/"

describe("Hellow World Server", function(){
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
				server.closeServer();
				done();
			})
		})

	})
})