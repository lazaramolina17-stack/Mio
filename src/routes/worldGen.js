const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const CityEngine = require('../services/CityEngine');

const router = Router();

function requireWorldMember(req, res, next) {
  db.query('SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2', [req.params.worldId, req.user.id])
    .then(function (r) { if (r.rows.length === 0) return res.status(404).json({ error: 'World not found or access denied' }); req.worldMember = r.rows[0]; next(); })
    .catch(function (err) { next(err); });
}

router.post('/:worldId/generate/settlement', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const cityEngine = new CityEngine(req.params.worldId);
    const settlementData = await cityEngine.generateSettlement_IA(req.user.id); // Requires AI integration for generation details
    const result = await db.query(
      `INSERT INTO settlements (world_id, name, type, region_id, population, wealth_level, security_level, location_lat, location_lng, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        req.params.worldId,
        settlementData.name,
        settlementData.type,
        settlementData.region_id,
        settlementData.population,
        settlementData.wealth_level,
        settlementData.security_level,
        settlementData.metadata.location_lat,
        settlementData.metadata.location_lng,
        JSON.stringify(settlementData.metadata),
      ]
    );
    res.status(201).json({ settlement: result.rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
