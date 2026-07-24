const db = require('../../db/connection');

const DEFAULT_SPELLS = [
  { name: 'Fireball', description: 'Una explosión de fuego que daña a los enemigos.', level: 3, school: 'evocation', components: ['G', 'V', 'S'], mana_cost: 15, cooldown: 10, effects: { type: 'damage', magnitude: 30, target: 'enemy' } },
  { name: 'Healing Word', description: 'Restaura puntos de vida a un aliado.', level: 2, school: 'evocation', components: ['V', 'S'], mana_cost: 10, cooldown: 5, effects: { type: 'heal', magnitude: 25, target: 'ally' } },
  { name: 'Shield', description: 'Crea una barrera mágica protectora.', level: 1, school: 'abjuration', components: ['V', 'S'], mana_cost: 5, cooldown: 30, effects: { type: 'buff', magnitude: 10, target: 'self', duration: 60 } },
  { name: 'Detect Magic', description: 'Revela auras mágicas cercanas.', level: 1, school: 'divination', components: ['V', 'S'], mana_cost: 5, cooldown: 60, effects: { type: 'detect', magnitude: 50, target: 'area' } },
];

class MagicSystem {
  constructor(worldId) {
    this.worldId = worldId;
  }

  async getPlayerMagic(playerId) {
    const result = await db.query('SELECT spell_id, prepared, learned_at, times_cast FROM player_magic WHERE player_id = $1', [playerId]);
    return result.rows;
  }

  async learnSpell(playerId, spellId) {
    // Check if player already learned, if not, insert
    const existing = await db.query('SELECT * FROM player_magic WHERE player_id = $1 AND spell_id = $2', [playerId, spellId]);
    if (existing.rows.length > 0) {
      return { message: 'Spell already learned' };
    }
    const result = await db.query('INSERT INTO player_magic (player_id, spell_id, learned_at) VALUES ($1, $2, NOW()) RETURNING *', [playerId, spellId]);
    return { message: 'Spell learned', learned: result.rows[0] };
  }

  async prepareSpell(playerId, spellId) {
    const result = await db.query('UPDATE player_magic SET prepared = TRUE WHERE player_id = $1 AND spell_id = $2 RETURNING *', [playerId, spellId]);
    if (result.rows.length === 0) return { error: 'Spell not learned by player' };
    return { message: 'Spell prepared', prepared: result.rows[0] };
  }

  async castSpell(playerId, spellId, targetId, targetType) {
    const player = await db.query('SELECT mana, mana_cost FROM player_stats WHERE player_id = $1', [playerId]); // Assuming player_stats table
    const spell = await db.query('SELECT * FROM spells WHERE id = $1', [spellId]);

    if (player.rows.length === 0 || spell.rows.length === 0) return { error: 'Player or spell not found' };

    const pData = player.rows[0];
    const sData = spell.rows[0];

    if (pData.mana < sData.mana_cost) return { error: 'Not enough mana' };

    // Simulate success chance, cooldown, etc.
    const successChance = 0.8; // Basic success chance
    if (Math.random() > successChance) return { error: 'Spell failed to cast' };

    // Deduct mana
    await db.query('UPDATE player_stats SET mana = mana - $1 WHERE player_id = $2', [sData.mana_cost, playerId]);

    // Apply effects
    let message = `Casted ${sData.name}!`;
    // Logic to apply damage, heal, buff, debuff etc. based on sData.effects
    // Target resolution (enemy, ally, self, area) would be complex

    await db.query('UPDATE player_magic SET times_cast = times_cast + 1 WHERE player_id = $1 AND spell_id = $2', [playerId, spellId]);

    // Record event
    await db.query('INSERT INTO history_events (world_id, tick, event_type, title, description, entities, importance) VALUES ($1, (SELECT COALESCE(tick_count, 0) FROM worlds WHERE id = $1), \'spell_cast\', $2, $3, $4, $5)', [this.worldId, `Cast ${sData.name}`, message, { playerId: playerId, spellId: spellId, targetId: targetId, targetType: targetType }, 3]);

    return { success: true, message: message, effects: sData.effects };
  }

  async createSpell(spellData) {
    const result = await db.query(
      'INSERT INTO spells (world_id, name, description, level, school, components, mana_cost, cooldown, effects) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [this.worldId, spellData.name, spellData.description, spellData.level, spellData.school, spellData.components, spellData.mana_cost, spellData.cooldown, JSON.stringify(spellData.effects)]
    );
    return result.rows[0];
  }
}

module.exports = MagicSystem;
