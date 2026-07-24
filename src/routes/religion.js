const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const ReligionEngine = require('../services/ReligionEngine');

const router = Router();

function requireWorldMember(req, res, next) {
  db.query('SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2', [req.params.worldId, req.user.id])
    .then(function (r) { if (r.rows.length === 0) return res.status(404).json({ error: 'World not found' }); req.worldMember = r.rows[0]; next(); })
    .catch(function (err) { next(err); });
}

router.get('/:worldId/deities', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const religion = new ReligionEngine(req.params.worldId);
    const deities = await religion.getDeities();
    res.json({ deities: deities });
  } catch (err) { next(err); }
});

router.post('/:worldId/deities', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const { name, domain, alignment, symbols } = req.body;
    if (!name) return res.status(400).json({ error: 'Deity name is required' });
    const world = await db.query('SELECT metadata FROM worlds WHERE id = $1', [req.params.worldId]);
    const meta = world.rows[0]?.metadata || {};
    const deities = meta.deities || [];
    deities.push({ name, domain, alignment, symbols });
    await db.query('UPDATE worlds SET metadata = jsonb_set(COALESCE(metadata, \'{}\'::jsonb), \'{deities}\', $1::jsonb) WHERE id = $2', [JSON.stringify(deities), req.params.worldId]);
    res.status(201).json({ deity: { name, domain, alignment, symbols } });
  } catch (err) { next(err); }
});

router.post('/:worldId/festival/:settlementId', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const religion = new ReligionEngine(req.params.worldId);
    const result = await religion.celebrateFestival(req.params.settlementId, req.body.deityName || 'Pelor');
    res.json({ message: 'Festival celebrated', result: result });
  } catch (err) { next(err); }
});

module.exports = router;
