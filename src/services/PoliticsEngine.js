const db = require('../../db/connection');

/**
 * Engine that simulates faction politics, diplomacy, and rebellions for a world.
 * Handles faction relations, conflicts, alliances, and settlement rebellions.
 */
class PoliticsEngine {
  /**
   * @param {string} worldId - UUID of the world
   */
  constructor(worldId) {
    this.worldId = worldId;
  }

  /**
   * Simulates a single political tick: evaluates all faction pairs for conflicts,
   * alliances, and updates influence accordingly.
   * @returns {Promise<{events: Array, conflicts: number, alliances: number}>}
   */
  async processPoliticsTick() {
    var factions = await db.query(
      'SELECT id, name, influence, metadata FROM factions WHERE world_id = $1 AND status = $2',
      [this.worldId, 'active']
    );

    if (factions.rows.length < 2) {
      return { events: [], conflicts: 0, alliances: 0 };
    }

    var events = [];
    var conflicts = 0;
    var alliances = 0;

    for (var i = 0; i < factions.rows.length; i++) {
      for (var j = i + 1; j < factions.rows.length; j++) {
        var f1 = factions.rows[i];
        var f2 = factions.rows[j];

        try {
          var relationResult = await db.query(
            `SELECT relation_value FROM faction_relations
             WHERE (faction_id_1 = $1 AND faction_id_2 = $2)
                OR (faction_id_1 = $2 AND faction_id_2 = $1)`,
            [f1.id, f2.id]
          );

          var relation = relationResult.rows.length > 0
            ? parseInt(relationResult.rows[0].relation_value, 10)
            : 50;

          if (relation < 0) {
            // War
            var winner = Math.random() < 0.5 ? f1 : f2;
            var loser = winner.id === f1.id ? f2 : f1;
            await db.query(
              'UPDATE factions SET influence = GREATEST(0, influence - 15) WHERE id = $1',
              [loser.id]
            );
            await db.query(
              'UPDATE factions SET influence = influence + 10 WHERE id = $1',
              [winner.id]
            );
            await this._logEvent('war', f1.id, f2.id, f1.name + ' está en guerra contra ' + f2.name);
            events.push({ type: 'war', faction1: f1.id, faction2: f2.id });
            conflicts++;
          } else if (relation < 20) {
            // Skirmish
            if (Math.random() < 0.1) {
              var skirmishWinner = Math.random() < 0.5 ? f1 : f2;
              await db.query(
                'UPDATE factions SET influence = influence + 5 WHERE id = $1',
                [skirmishWinner.id]
              );
              await this._logEvent('skirmish', f1.id, f2.id, 'Escaramuza entre ' + f1.name + ' y ' + f2.name);
              events.push({ type: 'skirmish', faction1: f1.id, faction2: f2.id });
              conflicts++;
            }
          } else if (relation > 80) {
            // Alliance / Trade
            var allianceChance = relation > 90 ? 0.3 : 0.15;
            if (Math.random() < allianceChance) {
              await db.query(
                'UPDATE factions SET influence = influence + 5 WHERE id IN ($1, $2)',
                [f1.id, f2.id]
              );
              await this._logEvent('alliance', f1.id, f2.id, 'Alianza comercial entre ' + f1.name + ' y ' + f2.name);
              events.push({ type: 'alliance', faction1: f1.id, faction2: f2.id });
              alliances++;
            }
          }
        } catch (err) {
          console.error('[PoliticsEngine] Error processing pair ' + f1.id + ' / ' + f2.id + ': ' + err.message);
        }
      }
    }

    console.log(
      '[PoliticsEngine:' + this.worldId + '] Tick complete: ' + conflicts + ' conflicts, ' + alliances + ' alliances'
    );

    return { events: events, conflicts: conflicts, alliances: alliances };
  }

  /**
   * Adjusts the relation value between two factions by a delta.
   * Creates a relation row if none exists.
   * @param {string} factionId1 - UUID of first faction
   * @param {string} factionId2 - UUID of second faction
   * @param {number} delta - Amount to adjust the relation by
   * @returns {Promise<object>} Updated relation row
   */
  async updateFactionRelation(factionId1, factionId2, delta) {
    var existing = await db.query(
      `SELECT id, relation_value FROM faction_relations
       WHERE (faction_id_1 = $1 AND faction_id_2 = $2)
          OR (faction_id_1 = $2 AND faction_id_2 = $1)`,
      [factionId1, factionId2]
    );

    if (existing.rows.length > 0) {
      var newVal = Math.max(-100, Math.min(100, parseInt(existing.rows[0].relation_value, 10) + delta));
      var result = await db.query(
        'UPDATE faction_relations SET relation_value = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newVal, existing.rows[0].id]
      );
      return result.rows[0];
    }

    var result = await db.query(
      `INSERT INTO faction_relations (faction_id_1, faction_id_2, relation_value)
       VALUES ($1, $2, $3) RETURNING *`,
      [factionId1, factionId2, Math.max(-100, Math.min(100, 50 + delta))]
    );
    return result.rows[0];
  }

  /**
   * Simulates diplomatic actions: alliance offers between friendly factions,
   * war declarations between hostile factions, and peace treaties between warring ones.
   * @returns {Promise<{actions: Array}>}
   */
  async processDiplomacy() {
    var factions = await db.query(
      'SELECT id, name, influence FROM factions WHERE world_id = $1 AND status = $2',
      [this.worldId, 'active']
    );

    if (factions.rows.length < 2) {
      return { actions: [] };
    }

    var actions = [];

    for (var i = 0; i < factions.rows.length; i++) {
      for (var j = i + 1; j < factions.rows.length; j++) {
        var f1 = factions.rows[i];
        var f2 = factions.rows[j];

        try {
          var relResult = await db.query(
            `SELECT relation_value, status FROM faction_relations
             WHERE (faction_id_1 = $1 AND faction_id_2 = $2)
                OR (faction_id_1 = $2 AND faction_id_2 = $1)`,
            [f1.id, f2.id]
          );

          var relation = relResult.rows.length > 0 ? parseInt(relResult.rows[0].relation_value, 10) : 50;
          var status = relResult.rows.length > 0 ? relResult.rows[0].status : 'neutral';

          // Alliance offer between friendly factions
          if (relation > 60 && status !== 'allied') {
            if (Math.random() < 0.2) {
              await db.query(
                'UPDATE faction_relations SET status = $1, relation_value = LEAST(100, relation_value + 10), updated_at = NOW() ' +
                'WHERE (faction_id_1 = $2 AND faction_id_2 = $3) OR (faction_id_1 = $3 AND faction_id_2 = $2)',
                ['allied', f1.id, f2.id]
              );
              actions.push({ type: 'alliance', faction1: f1.id, faction2: f2.id });
              await this._logEvent('diplomacy', f1.id, f2.id, 'Alianza formal entre ' + f1.name + ' y ' + f2.name);
            }
          }

          // War declaration between hostile factions with high influence
          if (relation < -20 && parseFloat(f1.influence) > 30 && status !== 'war') {
            if (Math.random() < 0.15) {
              await db.query(
                'UPDATE faction_relations SET status = $1, updated_at = NOW() ' +
                'WHERE (faction_id_1 = $2 AND faction_id_2 = $3) OR (faction_id_1 = $3 AND faction_id_2 = $2)',
                ['war', f1.id, f2.id]
              );
              actions.push({ type: 'war_declaration', faction1: f1.id, faction2: f2.id });
              await this._logEvent('diplomacy', f1.id, f2.id, f1.name + ' declara la guerra a ' + f2.name);
            }
          }

          // Peace treaty if at war and both sides are weakened
          if (status === 'war') {
            var f1Health = parseFloat(f1.influence);
            var f2Health = parseFloat(f2.influence);
            var avgHealth = (f1Health + f2Health) / 2;
            var warWeariness = 100 - avgHealth;

            if (warWeariness > 50 && Math.random() < 0.1) {
              await db.query(
                'UPDATE faction_relations SET status = $1, relation_value = LEAST(0, relation_value + 30), updated_at = NOW() ' +
                'WHERE (faction_id_1 = $2 AND faction_id_2 = $3) OR (faction_id_1 = $3 AND faction_id_2 = $2)',
                ['peace', f1.id, f2.id]
              );
              actions.push({ type: 'peace_treaty', faction1: f1.id, faction2: f2.id });
              await this._logEvent('diplomacy', f1.id, f2.id, 'Tratado de paz entre ' + f1.name + ' y ' + f2.name);
            }
          }
        } catch (err) {
          console.error('[PoliticsEngine] Diplomacy error ' + f1.id + ' / ' + f2.id + ': ' + err.message);
        }
      }
    }

    return { actions: actions };
  }

  /**
   * Simulates a rebellion in a settlement based on security, wealth, and faction relations.
   * @param {string} settlementId - UUID of the settlement
   * @returns {Promise<{rebelled: boolean, details: object}>}
   */
  async handleRebellion(settlementId) {
    var settlement = await db.query(
      'SELECT id, name, type, population, security_level, wealth_level, metadata FROM settlements WHERE id = $1 AND world_id = $2',
      [settlementId, this.worldId]
    );

    if (settlement.rows.length === 0) {
      return { rebelled: false, details: { error: 'Settlement not found' } };
    }

    var s = settlement.rows[0];
    var securityMap = { low: 0.4, moderate: 0.2, high: 0.1, extreme: 0.05 };
    var wealthMap = { poor: 0.3, moderate: 0.15, wealthy: 0.08, rich: 0.03 };

    var securityProb = securityMap[s.security_level] || 0.2;
    var wealthProb = wealthMap[s.wealth_level] || 0.15;

    // Faction relations modifier
    var factionRel = await db.query(
      `SELECT fr.relation_value FROM faction_relations fr
       JOIN factions f ON (f.id = fr.faction_id_1 OR f.id = fr.faction_id_2)
       WHERE f.world_id = $1 AND f.headquarters_id = $2
       LIMIT 1`,
      [this.worldId, settlementId]
    );

    var relModifier = factionRel.rows.length > 0
      ? Math.max(0, (100 - Math.abs(parseInt(factionRel.rows[0].relation_value, 10))) / 200)
      : 0.1;

    var rebellionChance = securityProb + wealthProb + relModifier;

    if (Math.random() < rebellionChance) {
      // Rebellion occurs
      await db.query(
        `UPDATE settlements
         SET security_level = CASE
           WHEN security_level = 'extreme' THEN 'high'
           WHEN security_level = 'high' THEN 'moderate'
           WHEN security_level = 'moderate' THEN 'low'
           ELSE 'low'
         END,
         updated_at = NOW()
         WHERE id = $1`,
        [settlementId]
      );

      // Possibly change faction owner
      var possibleOwners = await db.query(
        `SELECT id, name FROM factions
         WHERE world_id = $1 AND id != (
           SELECT COALESCE(headquarters_id, '') FROM factions WHERE headquarters_id = $2 LIMIT 1
         )
         ORDER BY RANDOM() LIMIT 1`,
        [this.worldId, settlementId]
      );

      var newOwner = null;
      if (possibleOwners.rows.length > 0 && Math.random() < 0.3) {
        newOwner = possibleOwners.rows[0];
        await db.query(
          'UPDATE factions SET headquarters_id = $1 WHERE id = $2',
          [settlementId, newOwner.id]
        );
      }

      await this._logEvent('rebellion', settlementId, null,
        'Rebelión en ' + s.name + (newOwner ? '. ' + newOwner.name + ' toma el control' : ''));

      console.log('[PoliticsEngine] Rebelión en ' + s.name + ' (' + settlementId + ')');

      return {
        rebelled: true,
        details: {
          settlementId: settlementId,
          name: s.name,
          newOwner: newOwner ? newOwner.id : null,
          newOwnerName: newOwner ? newOwner.name : null,
        },
      };
    }

    return { rebelled: false, details: { settlementId: settlementId, chance: rebellionChance } };
  }

  /**
   * Logs a political event to the historical record.
   * @param {string} type - Event type
   * @param {string} entityId1 - Primary entity UUID
   * @param {string|null} entityId2 - Secondary entity UUID
   * @param {string} description - Human-readable description
   * @returns {Promise<void>}
   */
  async _logEvent(type, entityId1, entityId2, description) {
    try {
      await db.query(
        `INSERT INTO history_events (world_id, type, entity_id, entity_type, description, importance, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          this.worldId,
          'politics_' + type,
          entityId1,
          'faction',
          description,
          5,
          JSON.stringify({ relatedEntityId: entityId2, eventType: type }),
        ]
      );
    } catch (err) {
      console.error('[PoliticsEngine] Failed to log event: ' + err.message);
    }
  }
}

module.exports = PoliticsEngine;