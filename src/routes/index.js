const { Router } = require('express');
const auth = require('./auth');
const worlds = require('./worlds');
const npcs = require('./npcs');

const router = Router();

router.use('/auth', auth);
router.use('/worlds', worlds);
router.use('/npcs', npcs);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
