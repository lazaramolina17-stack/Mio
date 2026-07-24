const db = require('../../db/connection');
const WorldSimulation = require('../services/WorldSimulation');
const Ecosystem = require('../services/Ecosystem');
const PoliticsEngine = require('../services/PoliticsEngine');
const ReligionEngine = require('../services/ReligionEngine');
const LegalSystem = require('../services/LegalSystem');
const MagicSystem = require('../services/MagicSystem');
const CityEngine = require('../services/CityEngine');
const AIDirector = require('../services/AIDirector'); // Assuming AIDirector is in place for lore generation

class HistoryEngine {
  constructor(worldId) {
    this.worldId = worldId;
  }

  async recordWorldEvent(eventData) {
    const { type, title, description, entities, importance, location, tick } = eventData;
    const result = await db.query(
      'INSERT INTO history_events (world_id, tick, event_type, title, description, entities, importance, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [this.worldId, tick, type, title, description, JSON.stringify(entities || {}), importance, JSON.stringify(location || {})]
    );
    
    if (importance >= 8) {
      // Potentially add to key_events table or a dedicated section in world metadata
      console.log(`[HistoryEngine] Key event recorded: ${title}`);
    }
    return result.rows[0];
  }

  async updateWorldLore() {
    const world = await db.query('SELECT tick_count, metadata FROM worlds WHERE id = $1', [this.worldId]);
    if (world.rows.length === 0) return;

    const currentTick = world.rows[0].tick_count || 0;
    const currentLore = world.rows[0].metadata?.lore || [];
    
    // Simple check: every 100 ticks, potentially generate a lore fragment if needed
    if (currentTick > 0 && currentTick % 100 === 0) {
      const recentEvents = await db.query('SELECT title, description, tick FROM history_events WHERE world_id = $1 ORDER BY tick DESC LIMIT 5', [this.worldId]);
      if (recentEvents.rows.length > 0) {
        const context = { worldData: world.rows[0], recentEvents: recentEvents.rows, currentTick: currentTick };
        const loreFragment = await this.generateLoreFragment(context);
        if (loreFragment) {
          currentLore.push(loreFragment);
          // Limit lore size to prevent bloat
          if (currentLore.length > 50) currentLore.shift(); 
          await db.query('UPDATE worlds SET metadata = jsonb_set(COALESCE(metadata, $1::jsonb), $2, $3) WHERE id = $4', ['{}', JSON.stringify('lore'), JSON.stringify(currentLore), this.worldId]);
        }
      }
    }
  }

  async generateLoreFragment(context) {
    const director = new AIDirector(this.worldId);
    const prompt = `Based on the following world context and recent events, generate a short, flavorful lore fragment (1-2 sentences) for the world's history.
    
    World Context:
    Name: ${context.worldData?.name}
    Ticks: ${context.currentTick}
    Metadata: ${JSON.stringify(context.worldData?.metadata)}
    
    Recent Events:
    ${context.recentEvents.map(e => `- ${e.title} (Tick ${e.tick})`).join('\n')}
    
    Lore Fragment:`;

    const response = await director.callAPI([{ role: 'system', content: prompt }]);
    return response ? { text: response, generatedAtTick: context.currentTick } : null;
  }
}

module.exports = HistoryEngine;
