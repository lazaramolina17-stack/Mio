const db = require('../../db/connection');

/**
 * Manages an individual NPC's memories, relationships and emotional state.
 * Memories are stored as a JSONB array in the npcs.memory column.
 */
class NPCMemory {
  /**
   * @param {string} npcId - UUID of the NPC
   */
  constructor(npcId) {
    this.npcId = npcId;
  }

  /**
   * Stores a new memory event for the NPC and updates emotional state /
   * relationships. If the memory count exceeds 50, consolidation is triggered.
   *
   * @param {object} event
   * @param {string}   event.type             - e.g. 'combat', 'conversation', 'discovery'
   * @param {string[]} event.entities          - UUIDs of other NPCs / players involved
   * @param {string}   event.description
   * @param {number}   event.emotionalImpact   - 1-10
   * @param {string}   [event.timestamp]       - ISO string; defaults to now
   * @returns {Promise<object>} The stored memory entry
   */
  async remember(event) {
    const npcResult = await db.query(
      'SELECT memory, emotional_state, relationships FROM npcs WHERE id = $1',
      [this.npcId]
    );
    if (npcResult.rows.length === 0) {
      throw new Error('NPC not found: ' + this.npcId);
    }

    const npc = npcResult.rows[0];
    const memory = npc.memory || [];
    const emotionalState = npc.emotional_state || {};
    const relationships = npc.relationships || {};

    const entry = {
      type: event.type,
      entities: event.entities || [],
      description: event.description,
      emotionalImpact: event.emotionalImpact,
      timestamp: event.timestamp || new Date().toISOString(),
      important: event.emotionalImpact >= 7,
    };

    memory.push(entry);

    // Update emotional_state: blend new impact into existing state
    const updatedEmotional = this._blendEmotionalState(emotionalState, entry);

    // Update relationships with involved entities
    const updatedRelationships = this._updateRelationships(
      relationships,
      entry.entities || [],
      entry.emotionalImpact
    );

    await db.query(
      `UPDATE npcs
       SET memory = $1::jsonb,
           emotional_state = $2::jsonb,
           relationships = $3::jsonb,
           updated_at = NOW()
       WHERE id = $4`,
      [
        JSON.stringify(memory),
        JSON.stringify(updatedEmotional),
        JSON.stringify(updatedRelationships),
        this.npcId,
      ]
    );

    if (memory.length > 50) {
      await this.consolidateMemory();
    }

    return entry;
  }

  /**
   * Searches stored memories by entity, type, timeframe or keywords.
   * Results are sorted by emotionalImpact descending, limited to 20.
   *
   * @param {object} query
   * @param {string} [query.entity]    - Filter by entity UUID
   * @param {string} [query.type]      - Filter by event type
   * @param {string} [query.timeframe] - ISO interval, e.g. '2024-01-01T00:00:00Z'
   * @param {string} [query.keywords]  - Substring search over description
   * @returns {Promise<Array<object>>}
   */
  async recall(query) {
    const npcResult = await db.query(
      'SELECT memory FROM npcs WHERE id = $1',
      [this.npcId]
    );
    if (npcResult.rows.length === 0) {
      return [];
    }

    let memories = npcResult.rows[0].memory || [];

    if (query.entity) {
      memories = memories.filter(function (m) {
        return (m.entities || []).indexOf(query.entity) !== -1;
      });
    }

    if (query.type) {
      memories = memories.filter(function (m) {
        return m.type === query.type;
      });
    }

    if (query.timeframe) {
      const from = new Date(query.timeframe).getTime();
      memories = memories.filter(function (m) {
        return new Date(m.timestamp).getTime() >= from;
      });
    }

    if (query.keywords) {
      const kw = query.keywords.toLowerCase();
      memories = memories.filter(function (m) {
        return (m.description || '').toLowerCase().indexOf(kw) !== -1;
      });
    }

    memories.sort(function (a, b) {
      return (b.emotionalImpact || 0) - (a.emotionalImpact || 0);
    });

    return memories.slice(0, 20);
  }

  /**
   * Returns the relationship data for a given target (NPC or player).
   * Defaults to neutral values when no relationship exists.
   *
   * @param {string} targetId
   * @returns {Promise<{affinity: number, trust: number, fear: number, respect: number}>}
   */
  async getRelationship(targetId) {
    const result = await db.query(
      'SELECT relationships FROM npcs WHERE id = $1',
      [this.npcId]
    );
    if (result.rows.length === 0) {
      return { affinity: 0, trust: 0, fear: 0, respect: 0 };
    }

    const relationships = result.rows[0].relationships || {};
    return relationships[targetId] || { affinity: 0, trust: 0, fear: 0, respect: 0 };
  }

  /**
   * Reads the NPC's memory from DB, removes old / low-impact entries and
   * keeps at most 100 of the most important memories.
   *
   * @returns {Promise<void>}
   */
  async consolidateMemory() {
    const result = await db.query(
      'SELECT memory FROM npcs WHERE id = $1',
      [this.npcId]
    );
    if (result.rows.length === 0) return;

    let memories = result.rows[0].memory || [];
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    // Remove entries with low impact AND older than 30 days
    memories = memories.filter(function (m) {
      if (m.emotionalImpact >= 3) return true;
      const age = now - new Date(m.timestamp).getTime();
      return age < thirtyDaysMs;
    });

    // Keep at most 100 most important
    memories.sort(function (a, b) {
      return (b.emotionalImpact || 0) - (a.emotionalImpact || 0);
    });
    memories = memories.slice(0, 100);

    await db.query(
      'UPDATE npcs SET memory = $1::jsonb, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(memories), this.npcId]
    );
  }

  /**
   * Quick helper to record an interaction with another entity.
   *
   * @param {string} targetId   - UUID of the other NPC / player
   * @param {string} description
   * @param {number} impact     - Emotional impact (1-10)
   * @returns {Promise<object>} The stored memory entry
   */
  async logInteraction(targetId, description, impact) {
    return this.remember({
      type: 'interaction',
      entities: [targetId],
      description: description,
      emotionalImpact: impact,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Blends a new memory's emotional impact into the NPC's current emotional state.
   * Uses a weighted average so recent events have stronger influence.
   *
   * @param {object} currentState
   * @param {object} memoryEntry
   * @returns {object}
   */
  _blendEmotionalState(currentState, memoryEntry) {
    const WEIGHT = 0.3;
    const impact = memoryEntry.emotionalImpact || 5;

    const blended = {
      happiness: Math.round(
        ((currentState.happiness || 50) * (1 - WEIGHT) + (impact > 5 ? impact * 5 : 0) * WEIGHT)
      ),
      energy: Math.round(
        ((currentState.energy || 50) * (1 - WEIGHT) + (memoryEntry.type === 'sleep' ? 80 : 40) * WEIGHT)
      ),
      stress: Math.round(
        ((currentState.stress || 20) * (1 - WEIGHT) + (impact > 7 ? impact * 8 : impact * 2) * WEIGHT)
      ),
    };

    blended.happiness = Math.min(100, Math.max(0, blended.happiness));
    blended.energy = Math.min(100, Math.max(0, blended.energy));
    blended.stress = Math.min(100, Math.max(0, blended.stress));

    return blended;
  }

  /**
   * Adjusts relationship scores based on a new interaction.
   *
   * @param {object} relationships
   * @param {string[]} entities
   * @param {number} emotionalImpact
   * @returns {object}
   */
  _updateRelationships(relationships, entities, emotionalImpact) {
    const delta = Math.round((emotionalImpact - 5) * 2);

    for (var i = 0; i < entities.length; i++) {
      var ent = entities[i];
      if (!relationships[ent]) {
        relationships[ent] = { affinity: 0, trust: 0, fear: 0, respect: 0 };
      }
      var rel = relationships[ent];
      rel.affinity = Math.min(100, Math.max(-100, (rel.affinity || 0) + delta));
      rel.trust = Math.min(100, Math.max(-100, (rel.trust || 0) + Math.round(delta / 2)));
      rel.respect = Math.min(100, Math.max(0, (rel.respect || 0) + Math.max(0, delta)));
    }

    return relationships;
  }
}

module.exports = NPCMemory;