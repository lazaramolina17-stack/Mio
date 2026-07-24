const db = require('../../db/connection');

const DEFAULT_DEITIES = [
  { name: 'Aureon', domain: 'sabiduría', alignment: 'lawful_good', symbols: 'libro abierto' },
  { name: 'Kord', domain: 'fuerza', alignment: 'chaotic_good', symbols: 'puño' },
  { name: 'Pelor', domain: 'sol', alignment: 'neutral_good', symbols: 'sol radiante' },
  { name: 'Raven Queen', domain: 'muerte', alignment: 'lawful_neutral', symbols: 'pluma negra' },
  { name: 'Sehanine', domain: 'luna', alignment: 'chaotic_good', symbols: 'media luna' },
];

class ReligionEngine {
  constructor(worldId) {
    this.worldId = worldId;
  }

  async getDeities() {
    const world = await db.query('SELECT metadata FROM worlds WHERE id = $1', [this.worldId]);
    if (world.rows[0] && world.rows[0].metadata && world.rows[0].metadata.deities) {
      return world.rows[0].metadata.deities;
    }
    return DEFAULT_DEITIES;
  }

  async processReligion() {
    const settlements = await db.query('SELECT id, name, type, metadata FROM settlements WHERE world_id = $1', [this.worldId]);
    for (const s of settlements.rows) {
      const meta = s.metadata || {};
      const influence = meta.religiousInfluence || 0;
      const delta = s.type === 'temple' || s.type === 'city' ? 2 : 1;
      await db.query(
        'UPDATE settlements SET metadata = jsonb_set(COALESCE(metadata, \'{}\'::jsonb), \'{religiousInfluence}\', $1::jsonb) WHERE id = $2',
        [JSON.stringify(influence + delta), s.id]
      );
    }
  }

  async celebrateFestival(settlementId, deityName) {
    const result = await db.query(
      'INSERT INTO history_events (world_id, tick, event_type, title, description, importance) VALUES ($1, (SELECT COALESCE(tick_count, 0) FROM worlds WHERE id = $1), \'festival\', $2, $3, 5) RETURNING id',
      [this.worldId, 'Festival de ' + deityName, 'Se celebró un gran festival en honor a ' + deityName + '. La comunidad se unió en celebración.']
    );
    const settleResult = await db.query(
      'UPDATE settlements SET metadata = jsonb_set(COALESCE(metadata, \'{}\'::jsonb), \'{morale}\', $1::jsonb) WHERE id = $2 RETURNING id',
      [JSON.stringify(15), settlementId]
    );
    return { eventId: result.rows[0].id, settlementId: settleResult.rows[0]?.id };
  }
}

module.exports = ReligionEngine;
