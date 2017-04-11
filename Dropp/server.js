//var firebase 	= require('./modules/firebase_mod.js');
var express 	= require('express');
var app 		= express();
var PORT 		= 80;
var bodyParser 	= require('body-parser')
var router 		= require('./modules/router_mod.js')(express.Router());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/api', router);

// Start listening
app.listen(PORT, (err) => {
    if (err) return console.log('Server error', err);

    console.log(`Dropp server is listening on port ${PORT}`);
});
