const db = require('../../db/connection');

const DEFAULT_LAWS = [
  { crime: 'murder', penalty: 'execution or life imprisonment' },
  { crime: 'theft', penalty: 'fine (value x 3) or hand removal' },
  { crime: 'assault', penalty: 'fine or 30 days prison' },
  { crime: 'heresy', penalty: 'varies by religion' },
  { crime: 'treason', penalty: 'execution' },
];

class LegalSystem {
  constructor(worldId) {
    this.worldId = worldId;
  }

  async getLawCode(factionId) {
    const faction = await db.query('SELECT laws FROM factions WHERE id = $1 AND world_id = $2', [factionId, this.worldId]);
    if (faction.rows[0] && faction.rows[0].laws && faction.rows[0].laws.length > 0) {
      return faction.rows[0].laws;
    }
    return DEFAULT_LAWS;
  }

  async judge(playerId, crime) {
    const evidence = Math.min(crime.evidence || 0, 100);
    const guilty = evidence > 50 || crime.severity > 7;

    if (!guilty) {
      return { verdict: 'not_guilty', sentence: null, message: 'Acusado absuelto por falta de pruebas.' };
    }

    let sentence;
    switch (crime.type) {
      case 'murder': sentence = { type: 'execution', duration: null, fine: 0 }; break;
      case 'theft': sentence = { type: 'fine', duration: null, fine: crime.severity * 50 }; break;
      case 'assault': sentence = { type: 'prison', duration: crime.severity * 10, fine: 0 }; break;
      case 'heresy': sentence = { type: 'exile', duration: null, fine: 0 }; break;
      case 'treason': sentence = { type: 'execution', duration: null, fine: 0 }; break;
      default: sentence = { type: 'fine', duration: null, fine: 25 };
    }

    return { verdict: 'guilty', sentence: sentence, message: 'Sentencia dictada según el código legal.' };
  }
}

module.exports = LegalSystem;
