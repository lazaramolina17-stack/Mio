const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const WeatherSystem = require('../services/WeatherSystem');

const router = Router();

function requireWorldMember(req, res, next) {
  db.query('SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2', [req.params.worldId, req.user.id])
    .then(function (r) { if (r.rows.length === 0) return res.status(404).json({ error: 'World not found' }); req.worldMember = r.rows[0]; next(); })
    .catch(function (err) { next(err); });
}

router.get('/:worldId/weather', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const regions = await db.query('SELECT id, name, climate FROM regions WHERE world_id = $1', [req.params.worldId]);
    const weather = [];
    for (const region of regions.rows) {
      const ws = new WeatherSystem(req.params.worldId, region.id);
      const current = await ws.getCurrentWeather();
      weather.push({ regionId: region.id, regionName: region.name, climate: region.climate, weather: current });
    }
    res.json({ weather: weather });
  } catch (err) { next(err); }
});

router.get('/:worldId/weather/:regionId', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const ws = new WeatherSystem(req.params.worldId, req.params.regionId);
    const region = await db.query('SELECT name, climate FROM regions WHERE id = $1', [req.params.regionId]);
    const weather = await ws.getCurrentWeather();
    const effects = await ws.getWeatherEffects();
    res.json({ region: region.rows[0]?.name, climate: region.rows[0]?.climate, weather: weather, effects: effects });
  } catch (err) { next(err); }
});

module.exports = router;
