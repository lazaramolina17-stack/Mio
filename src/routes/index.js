const { Router } = require('express');
const auth = require('./auth');
const worlds = require('./worlds');
const npcs = require('./npcs');
const regions = require('./regions');
const settlements = require('./settlements');
const history = require('./history');

const router = Router();

router.use('/auth', auth);
router.use('/worlds', worlds);
router.use('/worlds', regions);
router.use('/worlds', settlements);
router.use('/worlds', history);
router.use('/worlds', npcs);

router.get('/health', function (req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
