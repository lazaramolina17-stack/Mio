const db = require('../../db/connection');

const VALID_EVENT_TYPES = [
  'battle', 'discovery', 'death', 'founding', 'war', 'treaty',
  'coronation', 'disaster', 'festival', 'trade', 'construction',
  'exploration', 'betrayal', 'revolution', 'plague', 'migration',
];

/**
 * Manages historical events and timelines for a world.
 * Provides recording, filtering, and aggregation of events.
 */
class Chronology {
  /**
   * @param {string} worldId - UUID of the world
   */
  constructor(worldId) {
    this.worldId = worldId;
  }

  /**
   * Records a new historical event in the database.
   *
   * @param {object} event - Event data
   * @param {string} event.type - Event type (must be in VALID_EVENT_TYPES)
   * @param {string} event.title - Short title
   * @param {string} [event.description] - Longer description
   * @param {object} [event.entities] - Related entities { npcs, settlements, factions }
   * @param {number} [event.importance=5] - Importance from 1 to 10
   * @param {object} [event.location] - Location data { region_id, settlement_id, lat, lng }
   * @returns {Promise<object>} The inserted event row
   * @throws {Error} On validation failure
   */
  async recordEvent(event) {
    if (!event || typeof event !== 'object') {
      throw new Error('Event must be an object');
    }
    if (!event.type || !VALID_EVENT_TYPES.includes(event.type)) {
      throw new Error(
        `Invalid event type "${event.type}". Valid types: ${VALID_EVENT_TYPES.join(', ')}`
      );
    }
    if (!event.title || typeof event.title !== 'string' || event.title.trim().length === 0) {
      throw new Error('Event title is required and must be a non-empty string');
    }
    if (event.title.length > 200) {
      throw new Error('Event title must not exceed 200 characters');
    }

    const importance = event.importance;
    if (importance !== undefined && (typeof importance !== 'number' || importance < 1 || importance > 10)) {
      throw new Error('Importance must be a number between 1 and 10');
    }

    const tickResult = await db.query(
      'SELECT tick_count FROM worlds WHERE id = $1',
      [this.worldId]
    );
    if (tickResult.rows.length === 0) {
      throw new Error('World not found');
    }
    const currentTick = tickResult.rows[0].tick_count;

    const result = await db.query(
      `INSERT INTO history_events (world_id, tick, event_type, title, description, entities, importance, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        this.worldId,
        currentTick,
        event.type,
        event.title.trim(),
        event.description || null,
        event.entities ? JSON.stringify(event.entities) : '{}',
        importance !== undefined ? importance : 5,
        event.location ? JSON.stringify(event.location) : null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Returns a paginated, filtered timeline of events.
   *
   * @param {object} [filters] - Optional filters
   * @param {number} [filters.from_tick] - Inclusive lower bound
   * @param {number} [filters.to_tick] - Inclusive upper bound
   * @param {string[]} [filters.types] - Array of event types to include
   * @param {number} [filters.min_importance] - Minimum importance (1-10)
   * @param {number} [filters.limit=50] - Max rows to return
   * @param {number} [filters.offset=0] - Pagination offset
   * @returns {Promise<{events: object[], total: number}>}
   */
  async getTimeline(filters) {
    filters = filters || {};

    const conditions = ['world_id = $1'];
    const params = [this.worldId];
    let paramIndex = 2;

    if (filters.from_tick !== undefined) {
      conditions.push(`tick >= $${paramIndex++}`);
      params.push(filters.from_tick);
    }
    if (filters.to_tick !== undefined) {
      conditions.push(`tick <= $${paramIndex++}`);
      params.push(filters.to_tick);
    }
    if (Array.isArray(filters.types) && filters.types.length > 0) {
      const placeholders = filters.types.map(function (_, i) {
        return `$${paramIndex + i}`;
      });
      conditions.push(`event_type IN (${placeholders.join(', ')})`);
      params.push(...filters.types);
      paramIndex += filters.types.length;
    }
    if (filters.min_importance !== undefined) {
      conditions.push(`importance >= $${paramIndex++}`);
      params.push(filters.min_importance);
    }

    const whereClause = conditions.join(' AND ');
    const limit = filters.limit !== undefined ? filters.limit : 50;
    const offset = filters.offset !== undefined ? filters.offset : 0;

    const countResult = await db.query(
      `SELECT COUNT(*) AS total FROM history_events WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataResult = await db.query(
      `SELECT * FROM history_events
       WHERE ${whereClause}
       ORDER BY tick DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return { events: dataResult.rows, total };
  }

  /**
   * Returns an encyclopedia-style aggregate:
   *   - Events grouped by type with count
   *   - Major events (importance >= 8) sorted by tick DESC
   *
   * @returns {Promise<{byType: object[], majorEvents: object[]}>}
   */
  async getEncyclopedia() {
    const byType = await db.query(
      `SELECT event_type, COUNT(*)::int AS count
       FROM history_events
       WHERE world_id = $1
       GROUP BY event_type
       ORDER BY count DESC`,
      [this.worldId]
    );

    const majorEvents = await db.query(
      `SELECT * FROM history_events
       WHERE world_id = $1 AND importance >= 8
       ORDER BY tick DESC`,
      [this.worldId]
    );

    return { byType: byType.rows, majorEvents: majorEvents.rows };
  }
}

module.exports = Chronology;
