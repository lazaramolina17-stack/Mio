const { Router } = require('express');
const Joi = require('joi');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const NPCMemory = require('../services/NPCMemory');
const NPCRoutines = require('../services/NPCRoutines');

var router = Router();

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

var createNPCchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  age: Joi.number().integer().min(0).max(9999).optional(),
  gender: Joi.string().max(20).optional(),
  race: Joi.string().max(50).optional(),
  profession: Joi.string().max(100).optional(),
  settlement_id: Joi.string().uuid().optional(),
  personality: Joi.object().default({}),
  emotional_state: Joi.object().default({}),
  goals: Joi.array().default([]),
  fears: Joi.array().default([]),
  inventory: Joi.array().default([]),
  gold: Joi.number().min(0).default(0),
  reputation: Joi.number().integer().default(0),
  daily_routine: Joi.array().default([]),
  memory: Joi.array().default([]),
  relationships: Joi.object().default({}),
  status: Joi.string().valid('alive', 'dead', 'missing', 'imprisoned').default('alive'),
  metadata: Joi.object().default({}),
});

var memorySchema = Joi.object({
  type: Joi.string().required(),
  entities: Joi.array().items(Joi.string()).default([]),
  description: Joi.string().allow('').default(''),
  emotionalImpact: Joi.number().integer().min(1).max(10).required(),
  timestamp: Joi.string().isoDate().optional(),
});

var routineSchema = Joi.object({
  schedule: Joi.array().items(
    Joi.object({
      hour: Joi.number().integer().min(0).max(23).required(),
      activity: Joi.string().required(),
      location: Joi.string().uuid().allow(null).optional(),
      duration: Joi.number().integer().min(0).optional(),
    })
  ).required(),
});

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Verifies the requesting user is a member of the target world.
 * Sets req.worldId and req.worldMember.
 */
function requireWorldMember(req, res, next) {
  var worldId = req.params.worldId;
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
 * Verifies the NPC exists and belongs to the current world.
 * Sets req.npc on success.
 */
function requireNPCBelongsToWorld(req, res, next) {
  db.query(
    'SELECT * FROM npcs WHERE id = $1 AND world_id = $2',
    [req.params.npcId, req.worldId]
  )
    .then(function (result) {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'NPC not found in this world' });
      }
      req.npc = result.rows[0];
      next();
    })
    .catch(function (err) {
      next(err);
    });
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/worlds/:worldId/npcs
 * Lists NPCs with optional filters: settlement_id, profession, status.
 */
router.get('/:worldId/npcs', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    var query = 'SELECT * FROM npcs WHERE world_id = $1';
    var params = [req.worldId];
    var idx = 2;

    if (req.query.settlement_id) {
      query += ' AND settlement_id = $' + idx++;
      params.push(req.query.settlement_id);
    }
    if (req.query.profession) {
      query += ' AND profession = $' + idx++;
      params.push(req.query.profession);
    }
    if (req.query.status) {
      query += ' AND status = $' + idx++;
      params.push(req.query.status);
    }

    query += ' ORDER BY name ASC';

    var result = await db.query(query, params);
    res.json({ npcs: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/worlds/:worldId/npcs
 * Creates a new NPC in the world.
 */
router.post('/:worldId/npcs', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    var data = await createNPCchema.validateAsync(req.body);

    var result = await db.query(
      `INSERT INTO npcs
         (world_id, settlement_id, name, age, gender, race, profession,
          personality, emotional_state, goals, fears, inventory, gold,
          reputation, daily_routine, memory, relationships, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        req.worldId,
        data.settlement_id || null,
        data.name,
        data.age || null,
        data.gender || null,
        data.race || null,
        data.profession || null,
        JSON.stringify(data.personality),
        JSON.stringify(data.emotional_state),
        JSON.stringify(data.goals),
        JSON.stringify(data.fears),
        JSON.stringify(data.inventory),
        data.gold,
        data.reputation,
        JSON.stringify(data.daily_routine),
        JSON.stringify(data.memory),
        JSON.stringify(data.relationships),
        data.status,
      ]
    );

    res.status(201).json({ npc: result.rows[0] });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({
        error: 'ValidationError',
        details: err.details.map(function (d) { return d.message; }),
      });
    }
    next(err);
  }
});

/**
 * GET /api/worlds/:worldId/npcs/:npcId
 * Returns full NPC detail including routine and relationships.
 */
router.get('/:worldId/npcs/:npcId', authenticate, requireWorldMember, requireNPCBelongsToWorld, async function (req, res, next) {
  try {
    res.json({
      npc: req.npc,
      routine: req.npc.daily_routine || [],
      relationships: req.npc.relationships || {},
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/worlds/:worldId/npcs/:npcId
 * Updates NPC fields. Only provided fields are updated.
 */
router.put('/:worldId/npcs/:npcId', authenticate, requireWorldMember, requireNPCBelongsToWorld, async function (req, res, next) {
  try {
    var allowed = [
      'name', 'age', 'gender', 'race', 'profession', 'settlement_id',
      'personality', 'emotional_state', 'goals', 'fears', 'inventory',
      'gold', 'reputation', 'daily_routine', 'memory', 'relationships', 'status',
    ];

    var sets = [];
    var params = [];
    var idx = 1;

    for (var i = 0; i < allowed.length; i++) {
      var key = allowed[i];
      if (req.body[key] !== undefined) {
        var val = req.body[key];
        // Stringify objects/arrays for JSONB columns
        var isJsonb = ['personality', 'emotional_state', 'goals', 'fears',
                       'inventory', 'daily_routine', 'memory', 'relationships'].indexOf(key) !== -1;
        sets.push(key + ' = $' + idx++);
        params.push(isJsonb ? JSON.stringify(val) : val);
      }
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    sets.push('updated_at = NOW()');
    params.push(req.params.npcId);

    var result = await db.query(
      'UPDATE npcs SET ' + sets.join(', ') + ' WHERE id = $' + idx + ' RETURNING *',
      params
    );

    res.json({ npc: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/worlds/:worldId/npcs/:npcId
 * Marks the NPC as 'dead' instead of actually deleting the row.
 */
router.delete('/:worldId/npcs/:npcId', authenticate, requireWorldMember, requireNPCBelongsToWorld, async function (req, res, next) {
  try {
    var result = await db.query(
      "UPDATE npcs SET status = 'dead', updated_at = NOW() WHERE id = $1 RETURNING *",
      [req.params.npcId]
    );
    res.json({ npc: result.rows[0], message: 'NPC marked as dead' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/worlds/:worldId/npcs/:npcId/memory
 * Records a memory event for the NPC.
 */
router.post('/:worldId/npcs/:npcId/memory', authenticate, requireWorldMember, requireNPCBelongsToWorld, async function (req, res, next) {
  try {
    var data = await memorySchema.validateAsync(req.body);
    var memory = new NPCMemory(req.params.npcId);
    var entry = await memory.remember(data);
    res.status(201).json({ memory: entry });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({
        error: 'ValidationError',
        details: err.details.map(function (d) { return d.message; }),
      });
    }
    next(err);
  }
});

/**
 * GET /api/worlds/:worldId/npcs/:npcId/memory
 * Queries stored memories for the NPC. Optional query params: entity, type,
 * timeframe, keywords.
 */
router.get('/:worldId/npcs/:npcId/memory', authenticate, requireWorldMember, requireNPCBelongsToWorld, async function (req, res, next) {
  try {
    var memory = new NPCMemory(req.params.npcId);
    var query = {
      entity: req.query.entity || undefined,
      type: req.query.type || undefined,
      timeframe: req.query.timeframe || undefined,
      keywords: req.query.keywords || undefined,
    };
    var results = await memory.recall(query);
    res.json({ memories: results });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/worlds/:worldId/npcs/:npcId/routine
 * Assigns a new daily routine to the NPC.
 */
router.post('/:worldId/npcs/:npcId/routine', authenticate, requireWorldMember, requireNPCBelongsToWorld, async function (req, res, next) {
  try {
    var data = await routineSchema.validateAsync(req.body);
    var routines = new NPCRoutines(req.worldId);
    var updated = await routines.assignRoutine(req.params.npcId, data.schedule);
    res.json({ npc: updated });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({
        error: 'ValidationError',
        details: err.details.map(function (d) { return d.message; }),
      });
    }
    next(err);
  }
});

module.exports = router;