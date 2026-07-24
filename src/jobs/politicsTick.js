const db = require('../../db/connection');
const PoliticsEngine = require('../services/PoliticsEngine');
const ReligionEngine = require('../services/ReligionEngine');

async function processAllPolitics() {
  const worlds = await db.query("SELECT id, name FROM worlds WHERE status = 'active'");
  for (const world of worlds.rows) {
    try {
      const start = Date.now();
      const politics = new PoliticsEngine(world.id);
      await politics.processPoliticsTick();
      await politics.processDiplomacy();
      const religion = new ReligionEngine(world.id);
      await religion.processReligion();
      console.log('[PoliticsJob] World', world.name, 'completed in', Date.now() - start + 'ms');
    } catch (err) {
      console.error('[PoliticsJob] Failed for world', world.name, ':', err.message);
    }
  }
}

module.exports = { processAllPolitics };
