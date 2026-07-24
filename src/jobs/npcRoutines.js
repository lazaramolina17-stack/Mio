const db = require('../../db/connection');
const WorldSimulation = require('../services/WorldSimulation');
const NPCRoutines = require('../services/NPCRoutines');
const NPCMemory = require('../services/NPCMemory');

/**
 * Processes NPC routines for every active world in the database.
 * This job runs independently of the full world tick so it can be
 * scheduled at a different frequency if desirable.
 *
 * @returns {Promise<Array<{worldId: string, npcsProcessed: number, elapsed: number}>>}
 */
async function processAllWorldNPCRoutines() {
  console.log('[NPCRoutinesJob] Starting routine processing for all active worlds');

  var worldsResult = await db.query(
    "SELECT id, name, metadata FROM worlds WHERE status = 'active'"
  );

  if (worldsResult.rows.length === 0) {
    console.log('[NPCRoutinesJob] No active worlds found');
    return [];
  }

  var outcomes = [];

  for (var i = 0; i < worldsResult.rows.length; i++) {
    var world = worldsResult.rows[i];
    var start = Date.now();

    try {
      // Determine current in-game hour from world metadata
      var metadata = world.metadata || {};
      var time = metadata.time || {};
      var hour = parseInt(time.hour || '0', 10);

      console.log(
        '[NPCRoutinesJob] Processing world "' + world.name + '" (' + world.id + ') at hour ' + hour
      );

      var routines = new NPCRoutines(world.id);
      var processed = await routines.processRoutines(hour);

      var elapsed = Date.now() - start;
      outcomes.push({
        worldId: world.id,
        npcsProcessed: processed.length,
        elapsed: elapsed,
      });

      console.log(
        '[NPCRoutinesJob] World "' + world.name + '" processed ' +
        processed.length + ' NPCs in ' + elapsed + 'ms'
      );
    } catch (err) {
      var elapsed = Date.now() - start;
      console.error(
        '[NPCRoutinesJob] World "' + world.name + '" (' + world.id + ') failed: ' + err.message
      );
      outcomes.push({
        worldId: world.id,
        npcsProcessed: 0,
        elapsed: elapsed,
        error: err.message,
      });
    }
  }

  console.log('[NPCRoutinesJob] Finished. Processed ' + outcomes.length + ' worlds');
  return outcomes;
}

module.exports = { processAllWorldNPCRoutines };