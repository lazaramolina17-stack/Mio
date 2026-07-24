const db = require('../../db/connection');
const EconomyEngine = require('../services/EconomyEngine');

/**
 * Runs the economy simulation (trade tick + taxation) for every active world.
 * Each world is processed independently; a failure in one does not affect others.
 *
 * @returns {Promise<Array<{worldId: string, success: boolean, elapsed: number, error?: string}>>}
 */
async function runEconomyTick() {
  console.log('[EconomyTickJob] Starting economy tick for all active worlds');

  var worldsResult = await db.query(
    "SELECT id, name FROM worlds WHERE status = 'active'"
  );

  if (worldsResult.rows.length === 0) {
    console.log('[EconomyTickJob] No active worlds found');
    return [];
  }

  console.log('[EconomyTickJob] Found ' + worldsResult.rows.length + ' active world(s)');

  var outcomes = [];

  for (var i = 0; i < worldsResult.rows.length; i++) {
    var world = worldsResult.rows[i];
    var start = Date.now();

    try {
      console.log('[EconomyTickJob] Processing world "' + world.name + '" (' + world.id + ')');

      var engine = new EconomyEngine(world.id);
      await engine.processTradeTick();
      await engine.processTaxation();

      var elapsed = Date.now() - start;
      outcomes.push({
        worldId: world.id,
        success: true,
        elapsed: elapsed,
      });

      console.log('[EconomyTickJob] World "' + world.name + '" completed in ' + elapsed + 'ms');
    } catch (err) {
      var elapsed = Date.now() - start;
      console.error(
        '[EconomyTickJob] World "' + world.name + '" (' + world.id + ') failed: ' + err.message
      );
      outcomes.push({
        worldId: world.id,
        success: false,
        elapsed: elapsed,
        error: err.message,
      });
    }
  }

  var succeeded = outcomes.filter(function (o) { return o.success; }).length;
  console.log('[EconomyTickJob] Finished. ' + succeeded + '/' + outcomes.length + ' worlds succeeded');
  return outcomes;
}

module.exports = { runEconomyTick };