const { Router } = require('express');
const auth = require('./auth');
const worlds = require('./worlds');
const npcs = require('./npcs');
const regions = require('./regions');
const settlements = require('./settlements');
const history = require('./history');
const economy = require('./economy');
const chat = require('./chat');
const ai = require('./ai');

const router = Router();

router.use('/auth', auth);
router.use('/worlds', worlds);
router.use('/worlds', regions);
router.use('/worlds', settlements);
router.use('/worlds', history);
router.use('/worlds', npcs);
router.use('/worlds', economy);
router.use('/worlds', chat);
router.use('/worlds', ai);

router.get('/health', function (req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
