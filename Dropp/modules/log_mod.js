/**
 * log_mod - Server logging @module
 */

/**
 * log - Logs a detailed message to the server console
 * @param {string} _source the origin of the log event
 * @param {string} _message a detailed message about the event
 * @param {Object} [_request=null] the HTTP request
 */
var log = function(_source, _message, _request = null) {
	const NOW = new Date().toISOString();

	// If _request is null, the log call is coming from a regular function
	if (_request == null) {
		console.log('%s: [%s]: %s', NOW, _source, _message );
	} else {
		// Log information about an incoming HTTP request
		const IP = _request.headers['x-forwarded-for'] || _request.connection.remoteAddress;
		console.log('%s: [%s]: (%s) %s', NOW, _source, IP, _message);
	}
};

module.exports = {
	log : log
};
