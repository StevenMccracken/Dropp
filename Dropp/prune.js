const LOG = require('./modules/log_mod');
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
  log(`Prune ${iteration} started`);

  // Query the database for all dropps
  FIREBASE.GET(
    '/dropps',
    (dropps) => {
      for (let dropp in dropps) {
        const details = dropps[dropp];

        // Convert dropp timestamp to unix milliseconds
        const droppTimestamp = details.timestamp * 1000;

        // Get current unix timestamp in milliseconds
        const currentTimestamp = new Date();

        // If dropp timestamp is more than 24 hours in the past, delete it
        if (currentTimestamp - droppTimestamp > 86400000) {
          log(`Pruning dropp '${dropp}' (posted: ${new Date(droppTimestamp).toISOString()})`);

          FIREBASE.DELETE(
            `/dropps/${dropp}`,
            () => {
              log(`Successfully pruned dropp '${dropp}'`);

              // Now delete picture linked to dropp if it exists
              if (details.media) {
                log(`Pruning image linked to '${dropp}'`);
                MEDIA.deleteImage(
                  dropp,
                  (success) => {
                    if (success) log(`Successfully pruned image '${dropp}'`);
                  },
                  deleteImageErr => log(`Failed pruning image '${dropp}': ${deleteImageErr}`)
                );
              }
            },
            removeDroppErr => log(`Failed prunign dropp '${dropp}': ${removeDroppErr}`)
          );
        }
      }

      // Print out overall pruning results
      const END = new Date();
      log(`Prune ${iteration} finished`);
      log(`Prune ${iteration} runtime: ${(END - START) / 1000} seconds`);
      iteration++;
    },
    getDroppsErr => log(`Prune ${iteration} failed while fetching all dropps: ${getDroppsErr}`)
  );
}

/**
 * log - Logs a message to the server console
 * @param {String} _message the log message
 * @param {Object} _request the HTTP request
 */
function log(_message) {
  LOG.log('Prune Module', _message);
}
