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
const weather = require('./weather');
const ecosystem = require('./ecosystem');
const factions = require('./factions');
const religion = require('./religion');
const justice = require('./justice');

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
router.use('/worlds', weather);
router.use('/worlds', ecosystem);
router.use('/worlds', factions);
router.use('/worlds', religion);
router.use('/worlds', justice);
router.use('/worlds', magic);

router.get('/health', function (req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
