const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const AIDirector = require('../services/AIDirector');

const router = Router();

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

router.post('/:worldId/ai/narrate', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const director = new AIDirector(req.params.worldId);
    const narration = await director.generateNarration({
      scene: req.body.scene || '',
      action: req.body.action || '',
      playerActions: req.body.playerActions,
      presentNpcs: req.body.presentNpcs,
      relevantHistory: req.body.relevantHistory,
    });
    res.json({ narration: narration });
  } catch (err) {
    next(err);
  }
});

router.post('/:worldId/ai/dialogue/:npcId', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const director = new AIDirector(req.params.worldId);
    const result = await director.generateDialogue(req.params.npcId, req.body.message || '');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/:worldId/ai/quest', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const director = new AIDirector(req.params.worldId);
    const quest = await director.generateQuest({
      settlementId: req.body.settlementId,
      npcId: req.body.npcId,
      difficulty: req.body.difficulty,
    });
    res.json({ quest: quest });
  } catch (err) {
    next(err);
  }
});

router.post('/:worldId/ai/action', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const director = new AIDirector(req.params.worldId);
    const interpreted = await director.interpretAction(req.body.description || '');
    res.json({ action: interpreted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
