const db = require('../../db/connection');
const SimulationManager = require('../services/SimulationManager');

async function runSimulationJobs() {
  console.log('[SimulationManagerJob] Starting simulation jobs...');
  try {
    const worlds = await db.query("SELECT id, name, tick_count FROM worlds WHERE status = 'active'");
    if (worlds.rows.length === 0) {
      console.log('[SimulationManagerJob] No active worlds found.');
      return;
    }

    for (const world of worlds.rows) {
      try {
        const start = Date.now();
        const sm = new SimulationManager(world.id);
        await sm.runSingleWorldTick();
        console.log(`[SimulationManagerJob] World '${world.name}' (${world.id}) tick processed in ${Date.now() - start}ms.`);
      } catch (err) {
        console.error(`[SimulationManagerJob] Failed to process tick for world '${world.name}' (${world.id}):`, err);
      }
    }
  } catch (err) {
    console.error('[SimulationManagerJob] Error fetching active worlds:', err);
  }
}

module.exports = { runSimulationJobs };
