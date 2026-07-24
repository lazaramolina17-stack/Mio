const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const Ecosystem = require('../services/Ecosystem');

const router = Router();

function requireWorldMember(req, res, next) {
  db.query('SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2', [req.params.worldId, req.user.id])
    .then(function (r) { if (r.rows.length === 0) return res.status(404).json({ error: 'World not found' }); req.worldMember = r.rows[0]; next(); })
    .catch(function (err) { next(err); });
}

router.get('/:worldId/ecosystem', authenticate, requireWorldMember, async function (req, res, next) {
  const eco = new Ecosystem(req.params.worldId);
  try {
    const regions = await db.query('SELECT id, name, type FROM regions WHERE world_id = $1', [req.params.worldId]);
    const reports = [];
    for (const region of regions.rows) {
      const report = await eco.getEcosystemReport(region.id);
      reports.push({ regionId: region.id, regionName: region.name, report: report });
    }
    res.json({ ecosystems: reports });
  } catch (err) { next(err); }
});

router.get('/:worldId/ecosystem/:regionId', authenticate, requireWorldMember, async function (req, res, next) {
  const eco = new Ecosystem(req.params.worldId);
  try {
    const region = await db.query('SELECT name FROM regions WHERE id = $1', [req.params.regionId]);
    const report = await eco.getEcosystemReport(req.params.regionId);
    res.json({ region: region.rows[0]?.name, report: report });
  } catch (err) { next(err); }
});

module.exports = router;
