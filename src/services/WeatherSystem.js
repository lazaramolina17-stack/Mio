const db = require('../../db/connection');

const TEMPERATURE_RANGES = {
  templado: { spring: [10, 20], summer: [20, 30], autumn: [5, 15], winter: [-5, 10] },
  arido:    { spring: [20, 35], summer: [35, 50], autumn: [20, 30], winter: [10, 25] },
  tropical: { spring: [20, 30], summer: [25, 35], autumn: [20, 30], winter: [15, 25] },
  alpino:   { spring: [-5, 10], summer: [5, 15], autumn: [-10, 5], winter: [-20, 0] },
  humedo:   { spring: [10, 20], summer: [20, 30], autumn: [10, 20], winter: [0, 10] },
};

const CONDITION_TABLES = {
  templado: { spring: ['rainy', 'cloudy', 'sunny'], summer: ['sunny', 'cloudy', 'clear'], autumn: ['rainy', 'foggy', 'cloudy'], winter: ['snowy', 'cloudy', 'foggy'] },
  arido:    { spring: ['sunny', 'clear', 'windy'], summer: ['sunny', 'clear', 'windy'], autumn: ['sunny', 'clear', 'windy'], winter: ['sunny', 'cloudy', 'windy'] },
  tropical: { spring: ['rainy', 'stormy', 'cloudy'], summer: ['stormy', 'rainy', 'cloudy'], autumn: ['rainy', 'stormy', 'cloudy'], winter: ['rainy', 'cloudy', 'sunny'] },
  alpino:   { spring: ['cloudy', 'snowy', 'foggy'], summer: ['sunny', 'cloudy', 'clear'], autumn: ['cloudy', 'snowy', 'foggy'], winter: ['snowy', 'stormy', 'cloudy'] },
  humedo:   { spring: ['rainy', 'foggy', 'cloudy'], summer: ['rainy', 'stormy', 'cloudy'], autumn: ['rainy', 'foggy', 'cloudy'], winter: ['rainy', 'foggy', 'snowy'] },
};

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

const SEASONAL_ECONOMY_MODIFIERS = {
  food:      { spring: 1.2, summer: 1.4, autumn: 1.0, winter: 0.8 },
  weapon:    { spring: 1.1, summer: 1.0, autumn: 1.1, winter: 1.3 },
  armor:     { spring: 1.1, summer: 0.9, autumn: 1.1, winter: 1.3 },
  potion:    { spring: 1.0, summer: 1.2, autumn: 1.0, winter: 1.2 },
  tool:      { spring: 1.2, summer: 1.1, autumn: 1.0, winter: 0.9 },
  scroll:    { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
  clothing:  { spring: 1.0, summer: 0.9, autumn: 1.0, winter: 1.3 },
  wood:      { spring: 1.1, summer: 1.0, autumn: 1.3, winter: 0.7 },
  ore:       { spring: 1.0, summer: 1.1, autumn: 1.0, winter: 0.9 },
  default:   { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
};

const WEATHER_EFFECTS = {
  sunny:  { perception: 0, stealth: 0, movement: 1.0, description: 'Cielo despejado, buena visibilidad' },
  cloudy: { perception: 0, stealth: 0, movement: 1.0, description: 'Nublado, sin efectos significativos' },
  rainy:  { perception: -2, stealth: 1, movement: 0.9, description: 'Lluvia ligera: reduce percepción, enmascara ruidos' },
  stormy: { perception: -4, stealth: 2, movement: 0.7, description: 'Tormenta eléctrica: visión reducida, riesgo de rayos' },
  foggy:  { perception: -6, stealth: 2, movement: 0.8, description: 'Niebla densa: muy difícil ver, fácil perderse' },
  snowy:  { perception: -3, stealth: 0, movement: 0.5, description: 'Nevada: movimiento reducido al 50%, rastros visibles' },
  windy:  { perception: -1, stealth: -2, movement: 0.9, description: 'Viento fuerte: difícil oír, sin sigilo' },
  clear:  { perception: 1, stealth: 0, movement: 1.0, description: 'Cielo completamente despejado, visibilidad perfecta' },
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInRange(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

class WeatherSystem {
  /**
   * @param {string} worldId
   * @param {string} regionId
   */
  constructor(worldId, regionId) {
    this.worldId = worldId;
    this.regionId = regionId;
  }

  /**
   * Returns the current weather stored in the region's metadata.
   * @returns {Promise<object|null>}
   */
  async getCurrentWeather() {
    var result = await db.query(
      "SELECT metadata #>> '{current_weather}' AS weather FROM regions WHERE id = $1 AND world_id = $2",
      [this.regionId, this.worldId]
    );
    if (result.rows.length === 0) return null;
    var raw = result.rows[0].weather;
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Generates weather data for a given season and climate.
   * @param {string} season
   * @param {string} climate
   * @returns {{ temperature: number, condition: string, wind: string, precipitation: string, visibility: string, description: string }}
   */
  async generateWeather(season, climate) {
    var normalisedSeason = SEASONS.includes(season) ? season : 'spring';
    var normalisedClimate = TEMPERATURE_RANGES[climate] ? climate : 'templado';

    var tempRange = TEMPERATURE_RANGES[normalisedClimate][normalisedSeason];
    var temperature = randomInRange(tempRange[0], tempRange[1]);

    var conditions = CONDITION_TABLES[normalisedClimate][normalisedSeason];
    var condition = pickRandom(conditions);

    var windOptions = ['calm', 'light', 'moderate', 'strong', 'gale'];
    var wind = pickRandom(windOptions);

    var precipOptions = { sunny: 'none', clear: 'none', cloudy: 'low', rainy: 'moderate', stormy: 'heavy', foggy: 'low', snowy: 'moderate', windy: 'none' };
    var precipitation = precipOptions[condition] || 'none';

    var visibilityOptions = { sunny: 'excellent', clear: 'excellent', cloudy: 'good', rainy: 'reduced', stormy: 'poor', foggy: 'very_poor', snowy: 'reduced', windy: 'good' };
    var visibility = visibilityOptions[condition] || 'good';

    var desc = capitalize(normalisedClimate) + ' region, ' + normalisedSeason + '. ' +
      'Temperature: ' + temperature + '°C, ' + condition + ', ' + wind + ' wind.';

    return {
      temperature: temperature,
      condition: condition,
      wind: wind,
      precipitation: precipitation,
      visibility: visibility,
      description: desc,
    };
  }

  /**
   * Stores the weather object into the region's metadata.
   * @param {object} weather
   * @returns {Promise<void>}
   */
  async applyWeather(weather) {
    await db.query(
      `UPDATE regions
       SET metadata = jsonb_set(
         COALESCE(metadata, '{}'::jsonb),
         '{current_weather}',
         $2::jsonb
       ),
       updated_at = NOW()
       WHERE id = $1`,
      [this.regionId, JSON.stringify(weather)]
    );
  }

  /**
   * Returns economic modifier for a given item type based on the current season.
   * @param {string} itemType
   * @returns {Promise<number>}
   */
  async getSeasonalModifier(itemType) {
    var region = await db.query(
      "SELECT metadata #>> '{time,season}' AS season FROM worlds WHERE id = $1",
      [this.worldId]
    );
    var season = region.rows[0]?.season || 'spring';
    var table = SEASONAL_ECONOMY_MODIFIERS[itemType] || SEASONAL_ECONOMY_MODIFIERS.default;
    return table[season] || 1.0;
  }

  /**
   * Returns gameplay effects for the current weather.
   * @returns {Promise<{ perception: number, stealth: number, movement: number, description: string }>}
   */
  async getWeatherEffects() {
    var weather = await this.getCurrentWeather();
    if (!weather || !weather.condition) {
      return { perception: 0, stealth: 0, movement: 1.0, description: 'No weather data' };
    }
    return WEATHER_EFFECTS[weather.condition] || WEATHER_EFFECTS.clear;
  }
}

module.exports = WeatherSystem;