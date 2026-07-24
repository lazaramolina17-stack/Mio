const { Router } = require('express');
const Joi = require('joi');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const PoliticsEngine = require('../services/PoliticsEngine');

const router = Router();

function requireWorldMember(req, res, next) {
  db.query('SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2', [req.params.worldId, req.user.id])
    .then(function (r) { if (r.rows.length === 0) return res.status(404).json({ error: 'World not found' }); req.worldMember = r.rows[0]; next(); })
    .catch(function (err) { next(err); });
}

const factionSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('guild', 'kingdom', 'religion', 'cult', 'political_party').required(),
  leader_id: Joi.string().uuid().optional(),
  headquarters_id: Joi.string().uuid().optional(),
  wealth: Joi.number().min(0).optional(),
  influence: Joi.number().min(0).max(100).optional(),
});

router.get('/:worldId/factions', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const result = await db.query('SELECT * FROM factions WHERE world_id = $1 ORDER BY influence DESC', [req.params.worldId]);
    res.json({ factions: result.rows });
  } catch (err) { next(err); }
});

router.post('/:worldId/factions', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const data = await factionSchema.validateAsync(req.body);
    const result = await db.query(
      'INSERT INTO factions (world_id, name, type, leader_id, headquarters_id, wealth, influence) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [req.params.worldId, data.name, data.type, data.leader_id || null, data.headquarters_id || null, data.wealth || 0, data.influence || 50]
    );
    res.status(201).json({ faction: result.rows[0] });
  } catch (err) {
    if (err.isJoi) return res.status(400).json({ error: 'ValidationError', details: err.details.map(function (d) { return d.message; }) });
    next(err);
  }
});

router.get('/:worldId/factions/:id', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const result = await db.query('SELECT * FROM factions WHERE id = $1 AND world_id = $2', [req.params.id, req.params.worldId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Faction not found' });
    res.json({ faction: result.rows[0] });
  } catch (err) { next(err); }
});

router.put('/:worldId/factions/:id', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const data = await factionSchema.validateAsync(req.body);
    const result = await db.query(
      'UPDATE factions SET name=$2, type=$3, leader_id=$4, headquarters_id=$5, wealth=$6, influence=$7, updated_at=NOW() WHERE id=$1 AND world_id=$8 RETURNING *',
      [req.params.id, data.name, data.type, data.leader_id || null, data.headquarters_id || null, data.wealth || 0, data.influence || 50, req.params.worldId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Faction not found' });
    res.json({ faction: result.rows[0] });
  } catch (err) {
    if (err.isJoi) return res.status(400).json({ error: 'ValidationError', details: err.details.map(function (d) { return d.message; }) });
    next(err);
  }
});

router.put('/:worldId/factions/:id/relation/:targetId', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const delta = parseInt(req.body.delta) || 10;
    const politics = new PoliticsEngine(req.params.worldId);
    const relations = await politics.updateFactionRelation(req.params.id, req.params.targetId, delta);
    res.json({ relations: relations });
  } catch (err) { next(err); }
});

module.exports = router;
