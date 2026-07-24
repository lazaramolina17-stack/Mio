const db = require('../../db/connection');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

class Ecosystem {
  /**
   * @param {string} worldId
   */
  constructor(worldId) {
    this.worldId = worldId;
  }

  /**
   * Simulates one ecosystem tick: generates resources per region type.
   * @returns {Promise<Array<{regionId: string, regionName: string, changes: object}>>}
   */
  async processEcosystemTick() {
    var regionsResult = await db.query(
      'SELECT id, name, type, metadata FROM regions WHERE world_id = $1',
      [this.worldId]
    );

    var results = [];

    for (var i = 0; i < regionsResult.rows.length; i++) {
      var region = regionsResult.rows[i];
      var meta = region.metadata || {};
      var resources = meta.resources || {};
      var changes = {};

      try {
        switch (region.type) {
          case 'forest':
            var fauna = randomInt(10, 50);
            var flora = randomInt(5, 20);
            resources.fauna = (resources.fauna || 0) + fauna;
            resources.flora = (resources.flora || 0) + flora;
            changes.fauna = fauna;
            changes.flora = flora;
            break;

          case 'mountain':
            var minerals = randomInt(5, 20);
            resources.minerals = (resources.minerals || 0) + minerals;
            changes.minerals = minerals;
            break;

          case 'water':
          case 'sea':
          case 'ocean':
          case 'lake':
          case 'river':
            var fish = randomInt(10, 30);
            resources.fish = (resources.fish || 0) + fish;
            changes.fish = fish;
            break;

          case 'desert':
          case 'arid':
            var creatures = randomInt(1, 5);
            resources.resistant_creatures = (resources.resistant_creatures || 0) + creatures;
            changes.resistant_creatures = creatures;
            break;

          default:
            var generic = randomInt(1, 10);
            resources.generic_wildlife = (resources.generic_wildlife || 0) + generic;
            changes.generic_wildlife = generic;
            break;
        }

        await db.query(
          `UPDATE regions
           SET metadata = jsonb_set(
             COALESCE(metadata, '{}'::jsonb),
             '{resources}',
             $2::jsonb
           ),
           updated_at = NOW()
           WHERE id = $1`,
          [region.id, JSON.stringify(resources)]
        );

        console.log('[Ecosystem:' + this.worldId + '] Region "' + region.name + '" (' + region.type + ') +' + JSON.stringify(changes));
        results.push({ regionId: region.id, regionName: region.name, changes: changes });
      } catch (err) {
        console.error('[Ecosystem:' + this.worldId + '] Failed to process region "' + region.name + '": ' + err.message);
      }
    }

    return results;
  }

  /**
   * Simulates creature migration between two random regions. 10% chance trigger.
   * @returns {Promise<{migrated: boolean, from?: string, to?: string, amount?: number}|null>}
   */
  async migrateCreatures() {
    if (Math.random() > 0.1) return { migrated: false };

    var regionsResult = await db.query(
      'SELECT id, name, type, metadata FROM regions WHERE world_id = $1',
      [this.worldId]
    );

    if (regionsResult.rows.length < 2) return { migrated: false };

    var shuffled = regionsResult.rows.sort(function () { return Math.random() - 0.5; });
    var from = shuffled[0];
    var to = shuffled[1];

    var fromMeta = from.metadata || {};
    var toMeta = to.metadata || {};
    var fromResources = fromMeta.resources || {};
    var toResources = toMeta.resources || {};

    var faunaFrom = fromResources.fauna || 0;
    if (faunaFrom < 5) return { migrated: false, reason: 'Not enough fauna in source' };

    var migratePct = round2(0.1 + Math.random() * 0.3);
    var migrateAmount = Math.max(1, Math.floor(faunaFrom * migratePct));

    fromResources.fauna = faunaFrom - migrateAmount;
    toResources.fauna = (toResources.fauna || 0) + migrateAmount;

    // Check predator/prey imbalance
    var fromPredators = fromResources.predators || Math.floor(faunaFrom * 0.2);
    var toPrey = toResources.fauna || 0;
    if (fromPredators > 0 && toPrey > 0 && (fromPredators / toPrey) > 0.5) {
      // Too many predators relative to prey — reduce predators
      var cull = Math.ceil(fromPredators * 0.3);
      fromResources.predators = Math.max(0, fromPredators - cull);
      console.log('[Ecosystem:' + this.worldId + '] Predator cull in "' + from.name + '": -' + cull + ' predators');
    }

    await db.query(
      `UPDATE regions
       SET metadata = jsonb_set(
         COALESCE(metadata, '{}'::jsonb),
         '{resources}',
         $2::jsonb
       ),
       updated_at = NOW()
       WHERE id = $1`,
      [from.id, JSON.stringify(fromResources)]
    );

    await db.query(
      `UPDATE regions
       SET metadata = jsonb_set(
         COALESCE(metadata, '{}'::jsonb),
         '{resources}',
         $2::jsonb
       ),
       updated_at = NOW()
       WHERE id = $1`,
      [to.id, JSON.stringify(toResources)]
    );

    console.log('[Ecosystem:' + this.worldId + '] Migration: ' + migrateAmount + ' creatures from "' + from.name + '" to "' + to.name + '"');

    return { migrated: true, from: from.name, to: to.name, amount: migrateAmount };
  }

  /**
   * Simulates the food chain: predators hunt prey in each region.
   * @returns {Promise<Array<{regionId: string, regionName: string, hunted: number, starved: number}>>}
   */
  async huntAndFeed() {
    var regionsResult = await db.query(
      'SELECT id, name, type, metadata FROM regions WHERE world_id = $1',
      [this.worldId]
    );

    var results = [];

    for (var i = 0; i < regionsResult.rows.length; i++) {
      var region = regionsResult.rows[i];
      var meta = region.metadata || {};
      var resources = meta.resources || {};
      var hunters = resources.predators || Math.floor((resources.fauna || 0) * 0.2);

      if (hunters <= 0) continue;

      var prey = (resources.fauna || 0) + (resources.flora || 0) + (resources.fish || 0) + (resources.generic_wildlife || 0);

      if (prey <= 0 && (resources.resistant_creatures || 0) <= 0) {
        // No food — predators die
        var starved = Math.ceil(hunters * 0.5);
        resources.predators = Math.max(0, hunters - starved);
        console.log('[Ecosystem:' + this.worldId + '] No prey in "' + region.name + '", ' + starved + ' predators starved');
        await db.query(
          `UPDATE regions
           SET metadata = jsonb_set(
             COALESCE(metadata, '{}'::jsonb),
             '{resources}',
             $2::jsonb
           ),
           updated_at = NOW()
           WHERE id = $1`,
          [region.id, JSON.stringify(resources)]
        );
        results.push({ regionId: region.id, regionName: region.name, hunted: 0, starved: starved });
        continue;
      }

      // Hunt
      var huntRate = 0.1 + Math.random() * 0.2;
      var hunted = Math.max(1, Math.floor(prey * huntRate));

      // Reduce prey from various pools
      var remainingHunted = hunted;
      var pools = ['fauna', 'flora', 'fish', 'generic_wildlife', 'resistant_creatures'];
      for (var p = 0; p < pools.length && remainingHunted > 0; p++) {
        var pool = pools[p];
        var available = resources[pool] || 0;
        if (available <= 0) continue;
        var take = Math.min(available, Math.ceil(remainingHunted / (pools.length - p)));
        resources[pool] = available - take;
        remainingHunted -= take;
      }

      results.push({ regionId: region.id, regionName: region.name, hunted: hunted, starved: 0 });
      console.log('[Ecosystem:' + this.worldId + '] Hunt in "' + region.name + '": ' + hunters + ' predators hunted ' + hunted + ' prey');

      await db.query(
        `UPDATE regions
         SET metadata = jsonb_set(
           COALESCE(metadata, '{}'::jsonb),
           '{resources}',
           $2::jsonb
         ),
         updated_at = NOW()
         WHERE id = $1`,
        [region.id, JSON.stringify(resources)]
      );
    }

    return results;
  }

  /**
   * Returns a human-readable ecosystem report for a region.
   * @param {string} regionId
   * @returns {Promise<object|null>}
   */
  async getEcosystemReport(regionId) {
    var result = await db.query(
      'SELECT id, name, type, metadata FROM regions WHERE id = $1 AND world_id = $2',
      [regionId, this.worldId]
    );

    if (result.rows.length === 0) return null;

    var region = result.rows[0];
    var meta = region.metadata || {};
    var resources = meta.resources || {};

    var totalWildlife = 0;
    var breakdown = {};
    var resourceKeys = Object.keys(resources);
    for (var i = 0; i < resourceKeys.length; i++) {
      var key = resourceKeys[i];
      var val = resources[key];
      if (typeof val === 'number') {
        totalWildlife += val;
        breakdown[key] = val;
      }
    }

    var predators = resources.predators || Math.floor((resources.fauna || 0) * 0.2);
    var prey = totalWildlife - predators;
    var balance = predators > 0 && prey > 0 ? round2(predators / prey) : 0;

    var health = 'stable';
    if (balance > 0.5) health = 'unstable (too many predators)';
    else if (totalWildlife < 10) health = 'depleted';
    else if (totalWildlife > 1000) health = 'booming';

    return {
      regionId: region.id,
      regionName: region.name,
      regionType: region.type,
      totalWildlife: totalWildlife,
      predatorPreyRatio: balance,
      health: health,
      breakdown: breakdown,
    };
  }
}

module.exports = Ecosystem;