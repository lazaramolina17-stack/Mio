const db = require('../../db/connection');
const NPCRoutines = require('./NPCRoutines');
const EconomyEngine = require('./EconomyEngine');
let socketManager;
try { socketManager = require('./SocketManager'); } catch (e) { }

/**
 * Engine that simulates a single world tick.
 * A tick represents ~1 hour of in-game time.
 */
class WorldSimulation {
  /**
   * @param {string} worldId - UUID of the world to simulate
   */
  constructor(worldId) {
    this.worldId = worldId;
  }

  /**
   * Executes a full simulation tick for this world.
   * Each step is wrapped in try/catch so a single failure does not
   * abort the entire tick.
   *
   * @returns {Promise<{elapsed: number, steps: object}>}
   */
  async tick() {
    const tickStart = Date.now();
    const results = {};

    const steps = [
      ['advanceTime', 'advanceTime'],
      ['processNPCRoutines', 'processNPCRoutines'],
      ['processEconomy', 'processEconomy'],
      ['processEcosystem', 'processEcosystem'],
      ['processPolitics', 'processPolitics'],
      ['processWeather', 'processWeather'],
      ['generateEvents', 'generateEvents'],
      ['persistState', 'persistState'],
    ];

    for (const [key, method] of steps) {
      const stepStart = Date.now();
      try {
        results[key] = await this[method]();
        console.log(
          `[WorldSimulation:${this.worldId}] ${key} completed in ${Date.now() - stepStart}ms`
        );
      } catch (err) {
        results[key] = { error: err.message };
        console.error(
          `[WorldSimulation:${this.worldId}] ${key} failed: ${err.message}`
        );
      }
    }

    const elapsed = Date.now() - tickStart;
    console.log(
      `[WorldSimulation:${this.worldId}] tick finished in ${elapsed}ms`
    );

    if (socketManager && typeof socketManager.emitToWorld === 'function') {
      try {
        socketManager.emitToWorld(this.worldId, 'world:tick', {
          tick: this.tickCount || 0,
          elapsed: elapsed,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        // socket emission is non-critical
      }
    }

    return { elapsed, steps: results };
  }

  /**
   * Increments tick_count and advances the in-game clock.
   * Each tick moves one hour forward; every 24 ticks advances the day.
   * @returns {Promise<object>} The updated world row
   */
  async advanceTime() {
    const result = await db.query(
      `UPDATE worlds
       SET tick_count = tick_count + 1,
           metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
             'time',
             jsonb_build_object(
               'hour',   (COALESCE((metadata #>> '{time,hour}')::int, 0) + 1) % 24,
               'day',    CASE
                           WHEN (COALESCE((metadata #>> '{time,hour}')::int, 0) + 1) % 24 = 0
                             THEN COALESCE((metadata #>> '{time,day}')::int, 1) + 1
                           ELSE COALESCE((metadata #>> '{time,day}')::int, 1)
                         END,
               'season', COALESCE(metadata #>> '{time,season}', 'spring')
             )
           ),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, tick_count, metadata`,
      [this.worldId]
    );
    return result.rows[0];
  }

  /**
   * Processes NPC daily routines based on the current in-game hour.
   * Queries NPCs with a JOIN to settlements for location context.
   * @returns {Promise<Array>} Processed NPC results
   */
  async processNPCRoutines() {
    const world = await db.query(
      'SELECT metadata->\'time\'->>\'hour\' AS hour FROM worlds WHERE id = $1',
      [this.worldId]
    );
    const currentHour = parseInt(world.rows[0]?.hour || '0', 10);

    const npcs = await db.query(
      `SELECT n.id, n.name, n.settlement_id, n.daily_routine,
              s.name AS settlement_name, s.type AS settlement_type
       FROM npcs n
       LEFT JOIN settlements s ON s.id = n.settlement_id
       WHERE n.world_id = $1 AND n.status = 'alive'`,
      [this.worldId]
    );

    const results = [];
    for (const npc of npcs.rows) {
      try {
        const routine = npc.daily_routine || [];
        const action = routine.find(function (entry) {
          return entry.hour === currentHour;
        });
        if (action) {
          results.push({
            npcId: npc.id,
            name: npc.name,
            action: action.activity,
            location: action.location,
          });
        }
      } catch (err) {
        console.error(`[WorldSimulation] NPC routine error for ${npc.id}: ${err.message}`);
      }
    }
    return results;
  }

  /**
   * Delegates to EconomyEngine for trade tick and taxation.
   * Wrapped in try/catch per the tick loop's convention.
   * @returns {Promise<object>}
   */
  async processEconomy() {
    var engine = new EconomyEngine(this.worldId);
    var trade = await engine.processTradeTick();
    var tax = await engine.processTaxation();
    return { trade: trade, tax: tax };
  }

  /**
   * Stub – will process ecosystem creatures.
   * @returns {Promise<object>}
   */
  async processEcosystem() {
    return { status: 'stub', message: 'Ecosystem simulation not yet implemented' };
  }

  /**
   * Stub – will process faction politics and decisions.
   * @returns {Promise<object>}
   */
  async processPolitics() {
    return { status: 'stub', message: 'Politics simulation not yet implemented' };
  }

  /**
   * Generates random weather for each region in the world.
   * @returns {Promise<Array>} Weather data per region
   */
  async processWeather() {
    const regions = await db.query(
      'SELECT id, name, climate FROM regions WHERE world_id = $1',
      [this.worldId]
    );

    const weatherTypes = ['clear', 'cloudy', 'rain', 'storm', 'fog', 'snow'];
    const results = [];

    for (const region of regions.rows) {
      const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      const temperature = Math.floor(Math.random() * 40) - 5;
      const humidity = Math.floor(Math.random() * 100);

      await db.query(
        `UPDATE regions
         SET metadata = jsonb_set(
           COALESCE(metadata, '{}'::jsonb),
           '{current_weather}',
           $2::jsonb
         )
         WHERE id = $1`,
        [region.id, JSON.stringify({ weather, temperature, humidity })]
      );

      results.push({ regionId: region.id, weather, temperature, humidity });
    }

    return results;
  }

  /**
   * Stub – generates historical events based on world state.
   * @returns {Promise<Array>}
   */
  async generateEvents() {
    return { status: 'stub', message: 'Event generation not yet implemented' };
  }

  /**
   * Persists the simulation state: updates last_tick_at.
   * @returns {Promise<object>}
   */
  async persistState() {
    const result = await db.query(
      `UPDATE worlds
       SET last_tick_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, tick_count, last_tick_at`,
      [this.worldId]
    );
    return result.rows[0];
  }
}

module.exports = WorldSimulation;
