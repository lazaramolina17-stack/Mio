const db = require('../../db/connection');

/**
 * Base gold earned per profession type for the 'work' activity.
 * @private
 */
var PROFESSION_BASE_PAY = {
  noble: 5,
  merchant: 4,
  artisan: 3,
  blacksmith: 3,
  cleric: 3,
  guard: 2,
  innkeeper: 2,
  scribe: 2,
  priest: 2,
  farmer: 1,
  peasant: 1,
  laborer: 1,
  hunter: 2,
  soldier: 2,
  miner: 2,
  beggar: 0,
};

/**
 * Default pay for professions not listed above.
 */
var DEFAULT_PAY = 2;

/**
 * Manages daily routines for NPCs in a world. Each routine is a JSONB array
 * of { hour, activity, location, duration } objects stored in the npcs table.
 */
class NPCRoutines {
  /**
   * @param {string} worldId - UUID of the world
   */
  constructor(worldId) {
    this.worldId = worldId;
  }

  /**
   * Processes routines for all alive NPCs in the world at the given tick hour.
   * For each NPC the matching action is looked up, executed and persisted.
   *
   * @param {number} tickHour - Current in-game hour (0-23)
   * @returns {Promise<Array<{npcId: string, action: string, result: string}>>}
   */
  async processRoutines(tickHour) {
    var npcsResult = await db.query(
      `SELECT id, name, settlement_id, daily_routine, profession,
              gold, emotional_state, relationships, memory, status
       FROM npcs
       WHERE world_id = $1 AND status = 'alive'`,
      [this.worldId]
    );

    var processed = [];

    for (var i = 0; i < npcsResult.rows.length; i++) {
      var npc = npcsResult.rows[i];

      try {
        var action = this.getActionForHour(npc, tickHour);
        var result = await this.executeAction(npc, action);
        processed.push({
          npcId: npc.id,
          name: npc.name,
          action: action.activity,
          location: action.location,
          result: result,
        });

        console.log(
          '[NPCRoutines:' + this.worldId + '] ' + npc.name +
          ' (' + npc.id.substring(0, 8) + ')' +
          ' → ' + action.activity + ' @ ' + (action.location || '?')
        );
      } catch (err) {
        console.error(
          '[NPCRoutines:' + this.worldId + '] Error processing NPC ' +
          npc.id + ': ' + err.message
        );
        processed.push({
          npcId: npc.id,
          name: npc.name,
          action: 'error',
          result: err.message,
        });
      }
    }

    return processed;
  }

  /**
   * Returns the scheduled action for an NPC at the given hour.
   * If the NPC has active goals (goals array non-empty) the routine may be
   * overridden to 'travel' or 'idle' depending on goal priority.
   *
   * @param {object} npc  - NPC row from DB
   * @param {number} hour - In-game hour (0-23)
   * @returns {{activity: string, location: string|null}}
   */
  getActionForHour(npc, hour) {
    var routine = npc.daily_routine || [];

    // Check if NPC has active goals that override routine
    var goals = npc.goals || [];
    var hasPriorityGoal = goals.some(function (g) {
      return g.priority && g.priority >= 8 && g.status === 'active';
    });

    if (hasPriorityGoal) {
      return { activity: 'travel', location: npc.settlement_id };
    }

    for (var i = 0; i < routine.length; i++) {
      var entry = routine[i];
      if (entry.hour === hour) {
        return {
          activity: entry.activity,
          location: entry.location || npc.settlement_id,
        };
      }
    }

    return { activity: 'idle', location: npc.settlement_id };
  }

  /**
   * Executes a single action for an NPC and persists changes to the database.
   *
   * @param {object} npc    - NPC row from DB (must contain id, profession, gold, etc.)
   * @param {{activity: string, location: string|null}} action
   * @returns {Promise<string>} Human-readable result description
   */
  async executeAction(npc, action) {
    switch (action.activity) {

      case 'work': {
        var pay = PROFESSION_BASE_PAY[npc.profession] || DEFAULT_PAY;
        var amount = Math.floor(Math.random() * 5) + pay;
        await db.query(
          'UPDATE npcs SET gold = gold + $1, updated_at = NOW() WHERE id = $2',
          [amount, npc.id]
        );
        return 'earned ' + amount + ' gold (profession: ' + (npc.profession || 'none') + ')';
      }

      case 'sleep': {
        var emotional = npc.emotional_state || {};
        emotional.energy = 100;
        emotional.stress = Math.max(0, (emotional.stress || 0) - 30);
        emotional.happiness = Math.min(100, (emotional.happiness || 50) + 10);
        await db.query(
          'UPDATE npcs SET emotional_state = $1::jsonb, updated_at = NOW() WHERE id = $2',
          [JSON.stringify(emotional), npc.id]
        );
        return 'slept — energy restored, stress reduced';
      }

      case 'travel': {
        var targetId = action.location;
        if (targetId && targetId !== npc.settlement_id) {
          await db.query(
            'UPDATE npcs SET settlement_id = $1, updated_at = NOW() WHERE id = $2',
            [targetId, npc.id]
          );
          return 'travelled to settlement ' + targetId;
        }
        return 'already at destination';
      }

      case 'socialize': {
        var locationId = action.location || npc.settlement_id;
        var nearbyResult = await db.query(
          `SELECT id FROM npcs
           WHERE settlement_id = $1 AND id != $2 AND status = 'alive'
           LIMIT 5`,
          [locationId, npc.id]
        );

        if (nearbyResult.rows.length > 0) {
          var rels = npc.relationships || {};
          for (var i = 0; i < nearbyResult.rows.length; i++) {
            var peerId = nearbyResult.rows[i].id;
            if (!rels[peerId]) {
              rels[peerId] = { affinity: 0, trust: 0, fear: 0, respect: 0 };
            }
            rels[peerId].affinity = Math.min(100, (rels[peerId].affinity || 0) + 2);
            rels[peerId].trust = Math.min(100, (rels[peerId].trust || 0) + 1);
          }
          await db.query(
            'UPDATE npcs SET relationships = $1::jsonb, updated_at = NOW() WHERE id = $2',
            [JSON.stringify(rels), npc.id]
          );
          return 'socialized with ' + nearbyResult.rows.length + ' NPC(s)';
        }
        return 'no one to socialize with';
      }

      default: {
        // idle, wake_up, breakfast, lunch, dinner, leisure — log only
        return 'performed activity: ' + action.activity;
      }
    }
  }

  /**
   * Assigns or replaces the daily routine for a specific NPC.
   *
   * @param {string} npcId   - UUID of the NPC
   * @param {Array<{hour: number, activity: string, location?: string, duration?: number}>} schedule
   * @returns {Promise<object>} Updated NPC row
   */
  async assignRoutine(npcId, schedule) {
    var result = await db.query(
      `UPDATE npcs
       SET daily_routine = $1::jsonb, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, daily_routine`,
      [JSON.stringify(schedule), npcId]
    );

    if (result.rows.length === 0) {
      throw new Error('NPC not found: ' + npcId);
    }

    return result.rows[0];
  }

  /**
   * Returns all alive NPCs at a given settlement during a specific hour.
   * Looks up the routine to determine if the NPC is at that settlement at
   * the given hour, or falls back to the NPC's home settlement.
   *
   * @param {string} settlementId - UUID of the settlement
   * @param {number} hour         - In-game hour (0-23)
   * @returns {Promise<Array<{id: string, name: string}>>}
   */
  async getNPCsAtLocation(settlementId, hour) {
    var result = await db.query(
      `SELECT id, name, settlement_id, daily_routine
       FROM npcs
       WHERE world_id = $1 AND status = 'alive'`,
      [this.worldId]
    );

    var atLocation = [];

    for (var i = 0; i < result.rows.length; i++) {
      var npc = result.rows[i];
      var routine = npc.daily_routine || [];
      var found = false;

      for (var j = 0; j < routine.length; j++) {
        var entry = routine[j];
        if (entry.hour === hour) {
          if (entry.location === settlementId) {
            atLocation.push({ id: npc.id, name: npc.name });
            found = true;
          }
          break;
        }
      }

      if (!found && npc.settlement_id === settlementId) {
        atLocation.push({ id: npc.id, name: npc.name });
      }
    }

    return atLocation;
  }
}

module.exports = NPCRoutines;