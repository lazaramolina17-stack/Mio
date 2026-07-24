const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const MagicSystem = require('../services/MagicSystem');
const SystemBuilder = require('../services/SystemBuilder');

const router = Router();

function requireWorldMember(req, res, next) {
  db.query('SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2', [req.params.worldId, req.user.id])
    .then(function (r) { if (r.rows.length === 0) return res.status(404).json({ error: 'World not found or access denied' }); req.worldMember = r.rows[0]; next(); })
    .catch(function (err) { next(err); });
}

router.get('/:worldId/spells', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const spells = await db.query('SELECT * FROM spells WHERE world_id = $1', [req.params.worldId]);
    res.json({ spells: spells.rows });
  } catch (err) { next(err); }
});

router.post('/:worldId/spells', authenticate, requireWorldMember, async function (req, res, next) {
  // Only allow world owner/admin to create spells
  if (req.worldMember.role !== 'dm' && req.worldMember.role !== 'admin') { // Assuming 'dm' or 'admin' role can manage spells
    return res.status(403).json({ error: 'Forbidden: Only world owner or admin can create spells' });
  }
  try {
    const { name, description, level, school, components, mana_cost, cooldown, effects } = req.body;
    const magicSystem = new MagicSystem(req.params.worldId);
    const spell = await magicSystem.createSpell({ name, description, level, school, components, mana_cost, cooldown, effects });
    res.status(201).json({ spell: spell });
  } catch (err) { next(err); }
});

router.get('/:worldId/players/:playerId/spellbook', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const magicSystem = new MagicSystem(req.params.worldId);
    const spellbook = await magicSystem.getPlayerMagic(req.params.playerId);
    // Join spell details
    const spellIds = spellbook.map(s => s.spell_id);
    if (spellIds.length === 0) return res.json({ spellbook: [] });
    const spells = await db.query('SELECT * FROM spells WHERE id = ANY($1::uuid[])', [spellIds]);
    const spellbookWithDetails = spellbook.map(pb => {
      const spell = spells.rows.find(s => s.id === pb.spell_id);
      return { ...pb, ...spell };
    });
    res.json({ spellbook: spellbookWithDetails });
  } catch (err) { next(err); }
});

router.post('/:worldId/players/:playerId/learn', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const { spellId } = req.body;
    const magicSystem = new MagicSystem(req.params.worldId);
    const result = await magicSystem.learnSpell(req.params.playerId, spellId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:worldId/players/:playerId/prepare', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const { spellId } = req.body;
    const magicSystem = new MagicSystem(req.params.worldId);
    const result = await magicSystem.prepareSpell(req.params.playerId, spellId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:worldId/players/:playerId/cast', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const { spellId, targetId, targetType } = req.body;
    const magicSystem = new MagicSystem(req.params.worldId);
    const result = await magicSystem.castSpell(req.params.playerId, spellId, targetId, targetType);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:worldId/systems/:type', authenticate, requireWorldMember, async function (req, res, next) {
  // Only allow world owner/admin to build systems
  if (req.worldMember.role !== 'dm' && req.worldMember.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only world owner or admin can build systems' });
  }
  try {
    const builder = new SystemBuilder(req.params.worldId);
    if (req.params.type === 'default-magic') {
      await builder.buildDefaultSystems();
      res.json({ message: 'Default magic systems built successfully' });
    } else {
      res.status(400).json({ error: 'Invalid system type' });
    }
  } catch (err) { next(err); }
});

module.exports = router;
