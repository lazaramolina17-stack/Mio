const db = require('../../db/connection');
const MagicSystem = require('./MagicSystem'); // Assuming MagicSystem is in place

class SystemBuilder {
  constructor(worldId) {
    this.worldId = worldId;
  }

  async buildDefaultSystems() {
    console.log(`[SystemBuilder] Building default magic systems for world: ${this.worldId}`);

    const magicSystem = new MagicSystem(this.worldId);

    // Create default spells if they don't exist
    const existingSpells = await db.query('SELECT COUNT(*) FROM spells WHERE world_id = $1', [this.worldId]);
    if (parseInt(existingSpells.rows[0].count) === 0) {
      console.log('[SystemBuilder] Creating default spells...');
      const defaultSpells = [
        { name: 'Fireball', description: 'Una explosión de fuego que daña a los enemigos.', level: 3, school: 'evocation', components: ['G', 'V', 'S'], mana_cost: 15, cooldown: 10, effects: { type: 'damage', magnitude: 30, target: 'enemy' } },
        { name: 'Healing Word', description: 'Restaura puntos de vida a un aliado.', level: 2, school: 'evocation', components: ['V', 'S'], mana_cost: 10, cooldown: 5, effects: { type: 'heal', magnitude: 25, target: 'ally' } },
        { name: 'Shield', description: 'Crea una barrera mágica protectora.', level: 1, school: 'abjuration', components: ['V', 'S'], mana_cost: 5, cooldown: 30, effects: { type: 'buff', magnitude: 10, target: 'self', duration: 60 } },
        { name: 'Detect Magic', description: 'Revela auras mágicas cercanas.', level: 1, school: 'divination', components: ['V', 'S'], mana_cost: 5, cooldown: 60, effects: { type: 'detect', magnitude: 50, target: 'area' } },
      ];
      for (const spellData of defaultSpells) {
        await magicSystem.createSpell({ ...spellData, world_id: this.worldId });
      }
      console.log('[SystemBuilder] Default spells created.');
    }

    // Placeholder for creating default races with magical archetypes
    // Placeholder for creating default factions with magical affinities
    // Placeholder for creating quests related to magic items
    console.log('[SystemBuilder] Default systems build process initiated.');
  }

  // Example of creating a system alias (e.g., character classes)
  async createSystemAlias(type, name, description) {
    console.log(`[SystemBuilder] Creating system alias: ${type} - ${name}`);
    // Logic to add system aliases (e.g., 'class', 'race', 'trait') to world metadata or specific tables
    // This might involve updating 'worlds.settings' or 'worlds.metadata'
    await db.query('UPDATE worlds SET metadata = jsonb_set(COALESCE(metadata, $1::jsonb), $2, $3) WHERE id = $4', ['{}', JSON.stringify(['systems', type]), JSON.stringify({ name, description }), this.worldId]);
    console.log(`[SystemBuilder] System alias '${name}' (${type}) created.`);
  }
}

module.exports = SystemBuilder;
