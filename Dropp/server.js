//var firebase 	= require('./modules/firebase_mod.js');
var express     = require('express'),
    app 		    = express(),
    PORT 		    = 80,
    bodyParser  = require('body-parser'),
    router 		  = require('./modules/router_mod.js')(express.Router());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/', router);

app.listen(PORT, (err) => {
    if (err) return console.log('Server connection error', err);

    console.log(`Dropp server is listening on port ${PORT}`);
});
