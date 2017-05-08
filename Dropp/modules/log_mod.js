/* For Logging Purpose */



var log = function(_source, _message, _request = null){

	// const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	// 	console.log('%s: %s request received from IP %s', new Date().toISOString(), req.method, ip);
	if(_request == null){
		// console.log("[" + _source + "]: " + _message);
		console.log('%s: [%s]: %s', new Date().toISOString(), _source, _message );
	} else {
		const ip = _request.headers['x-forwarded-for'] || _request.connection.remoteAddress;
		// console.log("[" + _source + "]: (" +  +") " + _message );
		console.log('%s: [%s]: (%s) %s', new Date().toISOString(), _source, ip, _message);
	}

}


module.exports = {
	log : log
};