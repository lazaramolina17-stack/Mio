const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const HistoryEngine = require('../services/HistoryEngine'); // Ensure this path is correct

const router = Router();

function requireWorldMember(req, res, next) {
  db.query('SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2', [req.params.worldId, req.user.id])
    .then(function (r) { if (r.rows.length === 0) return res.status(404).json({ error: 'World not found or access denied' }); req.worldMember = r.rows[0]; next(); })
    .catch(function (err) { next(err); });
}

// Middleware to restrict access to world owner/DM for destructive or sensitive actions
function requireWorldOwnerOrAdmin(req, res, next) {
  if (!req.worldMember || (req.worldMember.role !== 'dm' && req.worldMember.role !== 'admin')) {
     return res.status(403).json({ error: 'Forbidden: Only world owner or admin can perform this action' });
  }
  next();
}

router.get('/:worldId/history', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const history = new HistoryEngine(req.params.worldId);
    const filters = {};
    if (req.query.from_tick) filters.from_tick = parseInt(req.query.from_tick, 10);
    if (req.query.to_tick) filters.to_tick = parseInt(req.query.to_tick, 10);
    if (req.query.types) filters.types = req.query.types.split(',').map(function (t) { return t.trim(); });
    if (req.query.min_importance) filters.min_importance = parseInt(req.query.min_importance, 10);
    if (req.query.limit) filters.limit = parseInt(req.query.limit, 10);
    if (req.query.offset) filters.offset = parseInt(req.query.offset, 10);
    if (req.query.entity) filters.entity = req.query.entity; // e.g., 'npc_id=...' or 'faction_id=...'
    if (req.query.location) filters.location = req.query.location; // e.g., 'region_id=...'

    const result = await history.getTimeline(filters); // Assuming getTimeline method exists and accepts filters
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:worldId/history/encyclopedia', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const history = new HistoryEngine(req.params.worldId);
    const result = await history.getEncyclopedia(); // Assuming getEncyclopedia method exists
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:worldId/tick', authenticate, requireWorldMember, requireWorldOwnerOrAdmin, async function (req, res, next) {
  try {
    // This endpoint might trigger a single tick in WorldSimulation
    // For now, we rely on the cron job `simulationManager.js`
    // We can add a manual tick trigger here if needed, but it should probably update the world state directly
    res.status(501).json({ error: 'Manual tick trigger not implemented yet. Use cron job.' });
  } catch (err) { next(err); }
});

module.exports = router;
