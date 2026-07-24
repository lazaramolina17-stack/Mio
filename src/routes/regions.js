const { Router } = require('express');
const Joi = require('joi');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');

const router = Router();

const createRegionSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().min(2).max(30).required(),
  climate: Joi.string().max(30).optional(),
  area: Joi.number().positive().optional(),
  center_lat: Joi.number().min(-90).max(90).optional(),
  center_lng: Joi.number().min(-180).max(180).optional(),
  metadata: Joi.object().default({}),
});

/**
 * Middleware that verifies the user belongs to the target world.
 * Sets req.worldMember and req.worldId.
 */
function requireWorldMember(req, res, next) {
  const worldId = req.params.worldId;
  db.query(
    'SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2',
    [worldId, req.user.id]
  )
    .then(function (result) {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'World not found or access denied' });
      }
      req.worldMember = result.rows[0];
      req.worldId = worldId;
      next();
    })
    .catch(function (err) {
      next(err);
    });
}

/**
 * GET /api/worlds/:worldId/regions
 * Lists all regions in a world.
 */
router.get('/:worldId/regions', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const result = await db.query(
      'SELECT * FROM regions WHERE world_id = $1 ORDER BY name ASC',
      [req.worldId]
    );
    res.json({ regions: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/worlds/:worldId/regions
 * Creates a new region in the world.
 */
router.post('/:worldId/regions', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const data = await createRegionSchema.validateAsync(req.body);
    const result = await db.query(
      `INSERT INTO regions (world_id, name, type, climate, area, center_lat, center_lng, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.worldId,
        data.name,
        data.type,
        data.climate || null,
        data.area || null,
        data.center_lat || null,
        data.center_lng || null,
        JSON.stringify(data.metadata),
      ]
    );
    res.status(201).json({ region: result.rows[0] });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: 'ValidationError', details: err.details.map(function (d) { return d.message; }) });
    }
    next(err);
  }
});

/**
 * GET /api/worlds/:worldId/regions/:id
 * Returns a single region by ID.
 */
router.get('/:worldId/regions/:id', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const result = await db.query(
      'SELECT * FROM regions WHERE id = $1 AND world_id = $2',
      [req.params.id, req.worldId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }
    res.json({ region: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
