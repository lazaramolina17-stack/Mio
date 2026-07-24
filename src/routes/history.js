const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const Chronology = require('../services/Chronology');
const { runWorldTick } = require('../jobs/worldTick');

const router = Router();

/**
 * Middleware that checks the requesting user belongs to the given world.
 * Sets req.worldMember on success.
 */
function requireWorldMember(req, res, next) {
  db.query(
    'SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2',
    [req.params.worldId, req.user.id]
  )
    .then(function (result) {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'World not found or access denied' });
      }
      req.worldMember = result.rows[0];
      next();
    })
    .catch(function (err) {
      next(err);
    });
}

/**
 * Middleware that restricts access to the world owner (dm) only.
 */
function requireWorldOwner(req, res, next) {
  if (!req.worldMember || req.worldMember.role !== 'dm') {
    return res.status(403).json({ error: 'Only the world owner can perform this action' });
  }
  next();
}

/**
 * GET /api/worlds/:worldId/history
 * Returns the event timeline with optional filters.
 *
 * Query params:
 *   from  - from_tick (inclusive)
 *   to    - to_tick (inclusive)
 *   types - comma-separated event types
 *   min_importance - minimum importance (1-10)
 *   limit  - page size (default 50)
 *   offset - page offset (default 0)
 */
router.get('/:worldId/history', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const chronology = new Chronology(req.params.worldId);
    const filters = {};

    if (req.query.from) filters.from_tick = parseInt(req.query.from, 10);
    if (req.query.to) filters.to_tick = parseInt(req.query.to, 10);
    if (req.query.types) filters.types = req.query.types.split(',').map(function (t) { return t.trim(); });
    if (req.query.min_importance) filters.min_importance = parseInt(req.query.min_importance, 10);
    if (req.query.limit) filters.limit = parseInt(req.query.limit, 10);
    if (req.query.offset) filters.offset = parseInt(req.query.offset, 10);

    const result = await chronology.getTimeline(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/worlds/:worldId/history/encyclopedia
 * Returns encyclopedia-style aggregation of events.
 */
router.get('/:worldId/history/encyclopedia', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const chronology = new Chronology(req.params.worldId);
    const result = await chronology.getEncyclopedia();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/worlds/:worldId/tick
 * Forces a manual simulation tick.
 * Only the world owner (dm) can trigger this.
 */
router.post('/:worldId/tick', authenticate, requireWorldMember, requireWorldOwner, async function (req, res, next) {
  try {
      const result = await runWorldTick(req.params.worldId);
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    res.json({ message: 'Tick completed', elapsed: result.elapsed });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
