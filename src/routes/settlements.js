const { Router } = require('express');
const Joi = require('joi');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');

const router = Router();

const createSettlementSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().min(2).max(30).required(),
  region_id: Joi.string().uuid().optional(),
  population: Joi.number().integer().min(0).default(0),
  wealth_level: Joi.string().valid('poor', 'moderate', 'wealthy', 'rich').default('moderate'),
  security_level: Joi.string().valid('low', 'moderate', 'high', 'extreme').default('moderate'),
  location_lat: Joi.number().min(-90).max(90).optional(),
  location_lng: Joi.number().min(-180).max(180).optional(),
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
 * GET /api/worlds/:worldId/settlements
 * Lists settlements in the world.
 * Optional query param: region_id to filter by region.
 */
router.get('/:worldId/settlements', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const { region_id } = req.query;
    let query = 'SELECT * FROM settlements WHERE world_id = $1';
    const params = [req.worldId];

    if (region_id) {
      query += ' AND region_id = $2';
      params.push(region_id);
    }
    query += ' ORDER BY name ASC';

    const result = await db.query(query, params);
    res.json({ settlements: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/worlds/:worldId/settlements
 * Creates a new settlement in the world.
 */
router.post('/:worldId/settlements', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const data = await createSettlementSchema.validateAsync(req.body);
    const result = await db.query(
      `INSERT INTO settlements (world_id, region_id, name, type, population, wealth_level, security_level, location_lat, location_lng, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.worldId,
        data.region_id || null,
        data.name,
        data.type,
        data.population,
        data.wealth_level,
        data.security_level,
        data.location_lat || null,
        data.location_lng || null,
        JSON.stringify(data.metadata),
      ]
    );
    res.status(201).json({ settlement: result.rows[0] });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: 'ValidationError', details: err.details.map(function (d) { return d.message; }) });
    }
    next(err);
  }
});

/**
 * GET /api/worlds/:worldId/settlements/:id
 * Returns a single settlement with its buildings included.
 */
router.get('/:worldId/settlements/:id', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const settlementResult = await db.query(
      'SELECT * FROM settlements WHERE id = $1 AND world_id = $2',
      [req.params.id, req.worldId]
    );
    if (settlementResult.rows.length === 0) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    const buildingsResult = await db.query(
      'SELECT * FROM buildings WHERE settlement_id = $1 ORDER BY name ASC',
      [req.params.id]
    );

    res.json({
      settlement: settlementResult.rows[0],
      buildings: buildingsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
