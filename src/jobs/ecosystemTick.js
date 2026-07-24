const db = require('../../db/connection');
const Ecosystem = require('../services/Ecosystem');
const WeatherSystem = require('../services/WeatherSystem');

async function processAllEcosystems() {
  const worlds = await db.query("SELECT id, name FROM worlds WHERE status = 'active'");
  for (const world of worlds.rows) {
    try {
      const start = Date.now();
      const eco = new Ecosystem(world.id);
      await eco.processEcosystemTick();
      if (Math.random() < 0.1) await eco.migrateCreatures();
      await eco.huntAndFeed();
      const regions = await db.query('SELECT id, climate FROM regions WHERE world_id = $1', [world.id]);
      for (const region of regions.rows) {
        const ws = new WeatherSystem(world.id, region.id);
        const weather = await ws.generateWeather('templado', region.climate || 'templado');
        await ws.applyWeather(weather);
      }
      console.log('[EcosystemJob] World', world.name, 'completed in', Date.now() - start + 'ms');
    } catch (err) {
      console.error('[EcosystemJob] Failed for world', world.name, ':', err.message);
    }
  }
}

module.exports = { processAllEcosystems };
