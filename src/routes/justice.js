const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const LegalSystem = require('../services/LegalSystem');

const router = Router();

function requireWorldMember(req, res, next) {
  db.query('SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2', [req.params.worldId, req.user.id])
    .then(function (r) { if (r.rows.length === 0) return res.status(404).json({ error: 'World not found' }); req.worldMember = r.rows[0]; next(); })
    .catch(function (err) { next(err); });
}

router.post('/:worldId/judge', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const legal = new LegalSystem(req.params.worldId);
    const result = await legal.judge(req.body.targetId, {
      type: req.body.crimeType,
      severity: req.body.severity || 5,
      evidence: req.body.evidence || 50,
      location: req.body.location,
    });
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/:worldId/laws/:factionId', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const legal = new LegalSystem(req.params.worldId);
    const laws = await legal.getLawCode(req.params.factionId);
    res.json({ laws: laws });
  } catch (err) { next(err); }
});

module.exports = router;
