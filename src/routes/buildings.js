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

router.get('/:worldId/settlements/:settlementId/buildings', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const buildings = await db.query('SELECT * FROM buildings WHERE settlement_id = $1', [req.params.settlementId]);
    res.json({ buildings: buildings.rows });
  } catch (err) { next(err); }
});

router.post('/:worldId/settlements/:settlementId/buildings', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const { name, type, metadata } = req.body;
    const cityEngine = new CityEngine(req.params.worldId);
    const building = await cityEngine.build(req.params.settlementId, { name, type, metadata });
    res.status(201).json({ building: building });
  } catch (err) { next(err); }
});

router.get('/:worldId/buildings/:buildingId', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const building = await db.query('SELECT * FROM buildings WHERE id = $1 AND settlement_id IN (SELECT id FROM settlements WHERE world_id = $2)', [req.params.buildingId, req.params.worldId]);
    if (building.rows.length === 0) return res.status(404).json({ error: 'Building not found' });
    res.json({ building: building.rows[0] });
  } catch (err) { next(err); }
});

router.put('/:worldId/buildings/:buildingId', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const { name, type, metadata } = req.body;
    const result = await db.query(
      'UPDATE buildings SET name=$1, type=$2, metadata=$3, updated_at=NOW() WHERE id=$4 AND settlement_id IN (SELECT id FROM settlements WHERE world_id = $5) RETURNING *',
      [name, type, JSON.stringify(metadata), req.params.buildingId, req.params.worldId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Building not found' });
    res.json({ building: result.rows[0] });
  } catch (err) { next(err); }
});

router.delete('/:worldId/buildings/:buildingId', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const result = await db.query('DELETE FROM buildings WHERE id = $1 AND settlement_id IN (SELECT id FROM settlements WHERE world_id = $2) RETURNING id', [req.params.buildingId, req.params.worldId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Building not found' });
    res.json({ message: 'Building deleted', id: result.rows[0].id });
  } catch (err) { next(err); }
});

module.exports = router;
