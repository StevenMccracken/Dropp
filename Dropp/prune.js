const MEDIA = require('./modules/media_mod.js');
const FIREBASE = require('./modules/firebase_mod.js');

var iteration = 0;

// Run the prune function every 60 seconds
setInterval(prune, 60000);

/**
 * prune - Deletes dropps and images that are older than 24 hours
 */
function prune() {
  const START = new Date();
  console.log('Prune %d start: %s', iteration, START.toISOString());

  // Query the database for all dropps
  FIREBASE.GET('/dropps', dropps => {
    var droppSuccessDeleted = 0, droppFailureDeleted = 0;
    var imageSuccessDeleted = 0, imageFailureDeleted = 0;

    for (var dropp in dropps) {
      const details = dropps[dropp];

      // Convert dropp timestamp to unix milliseconds
      const droppTimestamp = details.timestamp * 1000;

      // Get current unix timestamp in milliseconds
      const currentTimestamp = new Date();

      // If dropp timestamp is more than 24 hours in the past, delete it
      if (currentTimestamp - droppTimestamp > 86400000) {
        console.log('Pruning dropp \'%s\' (posted: %s)', dropp, new Date(droppTimestamp).toISOString());

        FIREBASE.POST('/dropps/' + dropp, null, 'remove', function() {
          console.log('Successfully pruned dropp \'%s\'', dropp);

          // Now delete picture linked to dropp if it exists
          if (details.media) {
            console.log('Pruning image linked to \'%s\'', dropp);

            MEDIA.deleteImage(dropp, success => {
              if (success) {
                console.log('Successfully pruned image \'%s\'', dropp);
              } else {
                // Image did not exist. Don't need to do anything
              }
            }, err => {
              console.log('Failed pruning image \'%s\': ', dropp, err);
            });
          }
        }, err => {
          console.log('Failed pruning dropp \'%s\': ', dropp, err);
       });
      }
    }

    // Print out overall pruning results
    const END = new Date();
    console.log('Prune %d finish: %s', iteration, END.toISOString());
    console.log('Prune %d runtime: %d seconds', iteration, (END - START) / 1000);

    iteration++;
  }, getDroppsErr => {
    console.log('Prune %d couldn\'t get all dropps: %s', getDroppsErr);
  });
}
