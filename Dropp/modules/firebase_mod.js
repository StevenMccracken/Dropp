/**
 * firebase_mod - Database @module
 */

 /* Firebase module */

const admin = require('firebase-admin');
const Log 	= require('./log_mod');


/** Testing Environment vs Deployment **/
/* Testing Environment will get the key from environment variable */
var serviceAccount = process.env.TEST;
if(serviceAccount){
	serviceAccount = JSON.parse(serviceAccount);
} else {
	// If enviroment variable doesn't exists, get the key from the file
	serviceAccount 	= require('../serviceAccountKey.json');
}
/********************************************/


admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://dropp-3a65d.firebaseio.com"
});

const db = admin.database();





var test = function(){
	console.log("test");
}

var GET = function(_url, callback, errorCallback){
	log("Get request to firebaes url='" + _url +"'");
	var ref = db.ref(_url);

	ref.once("value").then(snapshot => {
		// On Sucess
		callback(snapshot.val());
	}, err => {
		log("Problem with Firebase Module's GET");
		log(err);
		errorCallback(err);
	});
}


var POST = function(_url, _post, _operation, callback, errorCallback){

	log("POST to firebaes url='" + _url +"'");
	var ref = db.ref(_url);

	switch(_operation){
		case "push":
			ref.push(_post).then( key => {
				callback(key);
			}, err => {
				log("Problem pushing data to firebase");
				log(err);
				errorCallback(err);
			});
			// callback(ref.push(_post).key); // return the dropps id
			break;
		case "set":
			ref.set(_post).then( () => {
				callback();
			}, err => {
				log("Problem with Firebase Module's POST");
				log(err);
				errorCallback(err);
			});
			break;
		case 'remove':
			ref.remove().then( () => {
				callback();
			}, err => {
				errorCallback(err);
			});
			break;
	}
}


module.exports = {
	GET 		: GET,
	POST 		: POST
};


function log(_message){

	Log.log("Firebase Module", _message);
}