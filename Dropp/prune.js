const firebase = require('./modules/firebase_mod.js');
var iteration = 0;

// Run the prune function every 60 seconds
setInterval(prune, 60000);

function prune() {
  const start = new Date();
  console.log('Prune %d started at %s', iteration, start.toISOString());

  // Query the database for all dropps
  firebase.getAllDropps(dropps => {
    if (dropps.error != null) {
      return console.log('Prune job eniterationered error retrieving all dropps: %s', dropps.error.message);
    }

    var count = 0;
    for (var dropp in dropps) {
      const details = dropps[dropp];

      // Convert dropp timestamp to unix milliseconds
      const droppTimestamp = details.timestamp * 1000;

      // Get current unix timestamp in milliseconds
      const currentTimestamp = new Date();

      // If dropp timestamp is more than 24 hours in the past, delete it
      if (currentTimestamp - droppTimestamp > 86400000) {
        console.log('Deleting dropp %s because it is older than 24 hours (Post date: %s)', dropp, new Date(droppTimestamp).toISOString());
        firebase.deleteDropp(dropp, dbResult => {
          if (dbResult.error == null) count++;
          console.log(dbResult);
        });
      }
    }

    const end = new Date();
    console.log('Prune %d ended at %s', iteration++, end.toISOString());
    console.log('Total prune runtime: %d seconds', (end - start) / 1000);
    console.log('Successfully deleted %d dropps', count);
  });
}
