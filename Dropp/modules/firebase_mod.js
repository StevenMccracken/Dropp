/* Firebase module */

// Setup Firebase
var admin 			= require('firebase-admin');
var serviceAccount 	= require('../serviceAccountKey.json');
var db 				= null;

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://dropp-3a65d.firebaseio.com"
});

db = admin.database();




var exports = module.exports = {};

exports.test = function(){
	console.log("test");
}

/*
// Get request that return promise, currently not being use
exports.GET = function(_url){

	var ref = db.ref(_url);

	var promise = new Promise((resolve, reject) => {
		ref.once("value", (snapshot) => {
			// On Success
			var dropps = snapshot.val();
			resolve(dropps);
		}, (error) => {
			// On failure
			reject(error);
		})
	});

	return promise
}
*/

exports.GET = function(_url, callback){
	var ref = db.ref(_url);

	ref.once("value", (snapshot) => {
		// On Success
		callback(snapshot.val());
	}, err => {
		// On failure
		console.log(err);
	})
}


exports.POST = function(_url, _post, _operation){

	var ref = db.ref(_url);

	var promise = null;

	switch(_operation){
		case "push":
			promise = new Promise((resolve, reject) => {
				ref.push(_post, response => {
					// On Success
					resolve(response);
				}, error => {
					// On failure
					reject(error);
				})
			});
			break;
	}
	return promise;
}