const db = require('../../db/connection');
const WorldSimulation = require('../services/WorldSimulation');

/**
 * Runs a full simulation tick for every active world in the database.
 * Errors in one world do not affect others.
 *
 * @returns {Promise<Array<{worldId: string, success: boolean, error?: string}>>}
 */
async function runAllTicks() {
  console.log('[WorldTickJob] Starting tick for all active worlds');

  const result = await db.query(
    "SELECT id, name FROM worlds WHERE status = 'active'"
  );
  const worlds = result.rows;

  if (worlds.length === 0) {
    console.log('[WorldTickJob] No active worlds found');
    return [];
  }

  console.log(`[WorldTickJob] Found ${worlds.length} active world(s)`);

  const outcomes = [];

  for (const world of worlds) {
    try {
      console.log(`[WorldTickJob] Processing world "${world.name}" (${world.id})`);
      const simulation = new WorldSimulation(world.id);
      const tickResult = await simulation.tick();
      outcomes.push({
        worldId: world.id,
        success: true,
        elapsed: tickResult.elapsed,
      });
      console.log(
        `[WorldTickJob] World "${world.name}" tick completed in ${tickResult.elapsed}ms`
      );
    } catch (err) {
      console.error(`[WorldTickJob] World "${world.name}" (${world.id}) failed: ${err.message}`);
      outcomes.push({
        worldId: world.id,
        success: false,
        error: err.message,
      });
    }
  }

  console.log(`[WorldTickJob] Finished. ${outcomes.filter(function (o) { return o.success; }).length}/${outcomes.length} worlds succeeded`);
  return outcomes;
}

/**
 * Runs a single tick for a specific world.
 *
 * @param {string} worldId - UUID of the world to tick
 * @returns {Promise<{worldId: string, success: boolean, elapsed?: number, error?: string}>}
 */
async function runWorldTick(worldId) {
  console.log(`[WorldTickJob] Manual tick requested for world ${worldId}`);

  try {
    const world = await db.query(
      'SELECT id, name FROM worlds WHERE id = $1',
      [worldId]
    );
    if (world.rows.length === 0) {
      return { worldId, success: false, error: 'World not found' };
    }

    const simulation = new WorldSimulation(worldId);
    const tickResult = await simulation.tick();

    console.log(`[WorldTickJob] Manual tick for world ${worldId} completed in ${tickResult.elapsed}ms`);
    return { worldId, success: true, elapsed: tickResult.elapsed };
  } catch (err) {
    console.error(`[WorldTickJob] Manual tick for world ${worldId} failed: ${err.message}`);
    return { worldId, success: false, error: err.message };
  }
}

module.exports = { runAllTicks, runWorldTick };
