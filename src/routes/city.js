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

router.get('/:worldId/city/:settlementId', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const settlement = await db.query('SELECT * FROM settlements WHERE id = $1 AND world_id = $2', [req.params.settlementId, req.params.worldId]);
    if (settlement.rows.length === 0) return res.status(404).json({ error: 'Settlement not found' });
    
    const cityEngine = new CityEngine(req.params.worldId);
    const description = await cityEngine.generateSettlementDescription(settlement.rows[0]);
    const questHook = await cityEngine.generateQuestHook(settlement.rows[0]);

    res.json({ settlement: settlement.rows[0], description: description, questHook: questHook });
  } catch (err) { next(err); }
});

module.exports = router;
