/* Firebase module */

var admin 			= require('firebase-admin');
var serviceAccount 	= require('../serviceAccountKey.json');
var db 				= null;

// Authenticate firebase
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://dropp-3a65d.firebaseio.com'
});

db = admin.database();

var exports = module.exports = {};

exports.test = function() {
	console.log('test');
}

exports.GET = function(_url, callback) {
	var ref = db.ref(_url);

	ref.once('value', (snapshot) => {
		// On Success
		callback(snapshot.val());
	}, err => {
		// On failure
		console.log(err);
	});
}

exports.POST = function(_url, _post, _operation, callback) {
	var ref = db.ref(_url);

	switch(_operation) {
		case 'push':
			callback(ref.push(_post).key); // return the dropp id
			break;
	}
}
