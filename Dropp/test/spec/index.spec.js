
var request = require("request");
var server = require("../../server.js");
var base_url = "http://localhost:8080";
// port 80 require sudo accesss, in order for the test to be done on travis, we have to user other port
// Server will check for TEST env variable and adjust the port according to environment

if(process.env.TEST){
	// FIXME: Update base_url to different port??
	base_url = "http://localhost:8080";
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
                url: base_url + "/authenticate",
                form: {
                    username: 'test',
                    password: 'test',
                }
            };
        });

        var token = null;

        it('returns a 200 OK on valid user', function(done) {
            request.post(params, function(err, resp, body) {
                var data = JSON.parse(body);
                token = data.success.token;
                log("Get Token", JSON.stringify(data));
                // expect(resp.statusCode).toEqual(200);
                expect(data.success.token).toBeDefined();

                done();
            });
        });

        describe('Get Dropp', function(){

        	var dropp_key = null;
        	beforeEach(function(){
        		getUser = {
        			url: base_url + "/users/test",
        			headers : {
        				Authorization: token
        			}
        		};

        		postDropp = {
        			url: base_url + "/dropps",
        			headers : {
        				Authorization: token
        			},
        			form: {
	                    location : '0,0',
	                    timestamp: Math.floor(Date.now() / 1000),
	                    text: "sample text",
	                    media: 'false'
	                }
        		}
        	});

        	it("GET user information", function(done){
        		request.get(getUser, function(error, response, body){
        			log( "Geting user information" ,body);
					expect(body).toBeDefined();
					//('{"message":"This is the REST API for Dropp"}');
					done();
				})
        	});

        	it("POST Dropp", function(done) {
        		request.post(postDropp, function(error, response, body) {
        			log("Posting dropp" , body);
        			var data = JSON.parse(body)
        			dropp_key = data.droppId;
        			expect(body).toBeDefined();
        			done();
        		})
        	});


        	describe('Get Dropps', function(){

        		beforeEach(function(){
        			getDroppById = {
        				url: base_url + "/dropps/"+dropp_key,
	        			headers : {
	        				Authorization: token
	        			}
        			};

        			getAllDropp = {
        				url : base_url + "/dropps/",
        				headers : {
        					Authorization : token
        				}
        			};

                    getDroppByUser = {
                        url: base_url + '/users/test/dropps',
                        headers : {
                            Authorization: token
                        }
                    };

                    getDroppByLocation = {
                        url: base_url + "/location/dropps",
                        headers : {
                            Authorization: token
                        },
                        form: {
                            location : '0,0',
                            maxDistance : 500
                        }
                    }
        		});

        		it("GET Dropp by id", function(done){
        			request.get(getDroppById, function(error, response, body){
        				log('Get dropp',body);
        				log("URL",getDroppById.url);
        				expect(body).toBeDefined();
						done();
        			});
        		});

        		it("Get all dropps", function(done) {
        			request.get(getAllDropp, function(error, response, body) {

                        var data = JSON.parse(body);
                        log("Get all dropp", Object.keys(data).length);

                        expect(body).toBeDefined();
        				done();
                    });
                })

                it("Get dropps by User", function(done) {
                    request.get(getDroppByUser, function(error, response, body) {
                        var data = JSON.parse(body);
                        log("Get dropps by User", Object.keys(data).length);
                        expect(body).toBeDefined();
                        done();
                    });
                });

                it("Get dropps by Location", function(done) {
                    request.post(getDroppByLocation, function(error, response, body) {
                        var data = JSON.parse(body);
                        log("Get dropps by location", data.count);
                        expect(body).toBeDefined();
                        done();
						server.closeServer();
                    })
                })
        	}); // Descript get all drop

        }); // Get Drop
    });
});


function log(_topic, _message){
	console.log("[Grunt Test]: (%s) %s", _topic, _message);
}
