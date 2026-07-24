const db = require('../../db/connection');

const WEALTH_MODIFIERS = {
  poor: 0.8,
  moderate: 1.0,
  wealthy: 1.5,
  rich: 2.0,
};

const SEASONAL_MODIFIERS = {
  food:      { spring: 1.2, summer: 1.5, autumn: 0.9, winter: 0.7 },
  weapon:    { spring: 1.1, summer: 1.0, autumn: 1.2, winter: 1.4 },
  armor:     { spring: 1.1, summer: 0.9, autumn: 1.1, winter: 1.3 },
  potion:    { spring: 1.0, summer: 1.2, autumn: 1.1, winter: 1.3 },
  tool:      { spring: 1.3, summer: 1.2, autumn: 1.0, winter: 0.8 },
  scroll:    { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
  loot:      { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
  quest:     { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
  default:   { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
};

const PRODUCTION_TABLES = {
  village:  { food: 20, tool: 5,  loot: 2 },
  town:     { food: 40, tool: 10, weapon: 5, armor: 3, potion: 4, loot: 8 },
  city:     { food: 80, tool: 20, weapon: 15, armor: 10, potion: 12, scroll: 6, loot: 20 },
  fortress: { food: 30, weapon: 20, armor: 15, tool: 5,  loot: 5 },
  hamlet:   { food: 10, tool: 2,  loot: 1 },
  ruin:     { food: 0,  loot: 3 },
};

const CONSUMPTION_PER_PERSON = { food: 0.5 };

/**
 * Engine that simulates a living economy for a single world.
 * Handles dynamic pricing, trade ticks, taxation and market queries.
 */
class EconomyEngine {
  /**
   * @param {string} worldId - UUID of the world
   */
  constructor(worldId) {
    this.worldId = worldId;
    this._cache = {};
    this._cacheTimestamp = 0;
    this.CACHE_TTL = 30000;
  }

  /**
   * Calculates dynamic price for an item in a settlement.
   *
   * @param {string} itemId - UUID of the item
   * @param {string} settlementId - UUID of the settlement
   * @returns {Promise<{basePrice: number, modifiers: object, finalPrice: number}>}
   */
  async calculatePrice(itemId, settlementId) {
    var itemResult = await db.query(
      'SELECT id, name, type, value FROM items WHERE id = $1 AND world_id = $2',
      [itemId, this.worldId]
    );
    if (itemResult.rows.length === 0) {
      return { basePrice: 0, modifiers: {}, finalPrice: 0 };
    }

    var settlementResult = await db.query(
      'SELECT id, population, wealth_level, metadata FROM settlements WHERE id = $1 AND world_id = $2',
      [settlementId, this.worldId]
    );
    if (settlementResult.rows.length === 0) {
      return { basePrice: 0, modifiers: {}, finalPrice: 0 };
    }

    var item = itemResult.rows[0];
    var settlement = settlementResult.rows[0];
    var basePrice = parseFloat(item.value) || 0;
    var population = parseInt(settlement.population, 10) || 10;
    var wealthLevel = settlement.wealth_level || 'moderate';
    var metadata = settlement.metadata || {};
    var time = metadata.time || {};

    var wealthMod = WEALTH_MODIFIERS[wealthLevel] || 1.0;

    var localSupplyResult = await db.query(
      `SELECT COALESCE(SUM(i.quantity), 0) AS supply
       FROM inventories i
       JOIN items it ON it.id = i.item_id
       WHERE i.owner_type = 'settlement'
         AND i.owner_id = $1
         AND it.type = $2`,
      [settlementId, item.type]
    );
    var supply = parseInt(localSupplyResult.rows[0].supply, 10) || 0;

    var demandBase = Math.max(1, Math.round(population / 10));
    var typeDemandMultiplier = 1.0;
    if (item.type === 'food') typeDemandMultiplier = 3.0;
    else if (item.type === 'weapon') typeDemandMultiplier = 1.5;
    else if (item.type === 'armor') typeDemandMultiplier = 1.2;
    else if (item.type === 'potion') typeDemandMultiplier = 1.8;
    else if (item.type === 'tool') typeDemandMultiplier = 2.0;

    var demand = demandBase * typeDemandMultiplier;

    var scarcityRatio = supply > 0 ? demand / supply : 5.0;
    var scarcityMod = Math.min(5.0, Math.max(1.0, scarcityRatio));

    var season = time.season || 'spring';
    var seasonTable = SEASONAL_MODIFIERS[item.type] || SEASONAL_MODIFIERS.default;
    var seasonMod = seasonTable[season] || 1.0;

    var finalPrice = basePrice * wealthMod * scarcityMod * seasonMod;
    finalPrice = Math.round(finalPrice * 100) / 100;

    return {
      basePrice: basePrice,
      modifiers: {
        wealth: wealthMod,
        scarcity: scarcityMod,
        season: seasonMod,
      },
      finalPrice: finalPrice,
    };
  }

  /**
   * Simulates a single trade tick for all settlements in the world.
   * Generates production, consumes resources, and transfers goods between
   * nearby settlements.
   *
   * @returns {Promise<{settlements: number, transfers: number, produced: number, consumed: number}>}
   */
  async processTradeTick() {
    var settlementsResult = await db.query(
      'SELECT id, name, type, population, metadata FROM settlements WHERE world_id = $1 AND status = $2',
      [this.worldId, 'active']
    );

    var settlements = settlementsResult.rows;
    var transfers = 0;
    var totalProduced = 0;
    var totalConsumed = 0;

    for (var i = 0; i < settlements.length; i++) {
      var settlement = settlements[i];
      var type = settlement.type || 'village';
      var population = parseInt(settlement.population, 10) || 0;
      var productionTable = PRODUCTION_TABLES[type] || PRODUCTION_TABLES.village;

      // Consume food per person
      if (population > 0) {
        var foodNeeded = Math.round(population * CONSUMPTION_PER_PERSON.food);
        var foodInventory = await db.query(
          `SELECT i.id, i.quantity
           FROM inventories i
           JOIN items it ON it.id = i.item_id
           WHERE i.owner_type = 'settlement'
             AND i.owner_id = $1
             AND it.type = 'food'
           ORDER BY i.created_at ASC`,
          [settlement.id]
        );

        var foodAvailable = 0;
        for (var j = 0; j < foodInventory.rows.length; j++) {
          foodAvailable += parseInt(foodInventory.rows[j].quantity, 10);
        }

        var toConsume = Math.min(foodNeeded, foodAvailable);
        var remaining = toConsume;

        for (var k = 0; k < foodInventory.rows.length && remaining > 0; k++) {
          var row = foodInventory.rows[k];
          var qty = parseInt(row.quantity, 10);
          var deduct = Math.min(qty, remaining);
          remaining -= deduct;
          var newQty = qty - deduct;
          if (newQty <= 0) {
            await db.query('DELETE FROM inventories WHERE id = $1', [row.id]);
          } else {
            await db.query('UPDATE inventories SET quantity = $1 WHERE id = $2', [newQty, row.id]);
          }
        }

        totalConsumed += toConsume;
      }

      // Produce goods
      var itemTypes = Object.keys(productionTable);
      for (var m = 0; m < itemTypes.length; m++) {
        var prodType = itemTypes[m];
        var baseAmount = productionTable[prodType];
        if (baseAmount <= 0) continue;

        var producedQty = Math.max(1, Math.round(baseAmount * (0.5 + Math.random() * 0.5)));

        var itemForType = await db.query(
          'SELECT id FROM items WHERE world_id = $1 AND type = $2 ORDER BY RANDOM() LIMIT 1',
          [this.worldId, prodType]
        );

        if (itemForType.rows.length > 0) {
          var existent = await db.query(
            `SELECT id FROM inventories
             WHERE owner_type = 'settlement'
               AND owner_id = $1
               AND item_id = $2`,
            [settlement.id, itemForType.rows[0].id]
          );

          if (existent.rows.length > 0) {
            await db.query(
              'UPDATE inventories SET quantity = quantity + $1 WHERE id = $2',
              [producedQty, existent.rows[0].id]
            );
          } else {
            await db.query(
              `INSERT INTO inventories (item_id, owner_type, owner_id, quantity)
               VALUES ($1, 'settlement', $2, $3)`,
              [itemForType.rows[0].id, settlement.id, producedQty]
            );
          }

          totalProduced += producedQty;
        }
      }
    }

    // Simulate caravan transfers between nearby settlements
    for (var n = 0; n < settlements.length; n++) {
      var src = settlements[n];
      var neighbors = await db.query(
        `SELECT s.id, s.name
         FROM settlements s
         WHERE s.world_id = $1
           AND s.id != $2
           AND s.status = 'active'
         ORDER BY RANDOM()
         LIMIT 2`,
        [this.worldId, src.id]
      );

      for (var p = 0; p < neighbors.rows.length; p++) {
        var dst = neighbors.rows[p];

        var surplusItems = await db.query(
          `SELECT i.id, i.item_id, i.quantity, it.name, it.type
           FROM inventories i
           JOIN items it ON it.id = i.item_id
           WHERE i.owner_type = 'settlement'
             AND i.owner_id = $1
             AND i.quantity > 5
           ORDER BY RANDOM()
           LIMIT 3`,
          [src.id]
        );

        for (var q = 0; q < surplusItems.rows.length; q++) {
          var surp = surplusItems.rows[q];
          var transferQty = Math.min(parseInt(surp.quantity, 10), Math.ceil(parseInt(surp.quantity, 10) / 2));

          await db.query(
            'UPDATE inventories SET quantity = quantity - $1 WHERE id = $2',
            [transferQty, surp.id]
          );

          var dstInv = await db.query(
            `SELECT id FROM inventories
             WHERE owner_type = 'settlement'
               AND owner_id = $1
               AND item_id = $2`,
            [dst.id, surp.item_id]
          );

          if (dstInv.rows.length > 0) {
            await db.query(
              'UPDATE inventories SET quantity = quantity + $1 WHERE id = $2',
              [transferQty, dstInv.rows[0].id]
            );
          } else {
            await db.query(
              `INSERT INTO inventories (item_id, owner_type, owner_id, quantity)
               VALUES ($1, 'settlement', $2, $3)`,
              [surp.item_id, dst.id, transferQty]
            );
          }

          transfers++;
        }
      }
    }

    return {
      settlements: settlements.length,
      transfers: transfers,
      produced: totalProduced,
      consumed: totalConsumed,
    };
  }

  /**
   * Simulates taxation for all non-poor settlements, transferring a percentage
   * of their wealth to the owning faction.
   *
   * @returns {Promise<{collected: number, settlements: number, details: object[]}>}
   */
  async processTaxation() {
    var settlementsResult = await db.query(
      `SELECT s.id, s.name, s.wealth_level, s.population
       FROM settlements s
       WHERE s.world_id = $1
         AND s.status = 'active'
         AND s.wealth_level != 'poor'`,
      [this.worldId]
    );

    var details = [];
    var totalCollected = 0;

    for (var i = 0; i < settlementsResult.rows.length; i++) {
      var settlement = settlementsResult.rows[i];
      var wealthLevel = settlement.wealth_level || 'moderate';
      var population = parseInt(settlement.population, 10) || 10;

      // Calculate tax: 1-5% of imputed wealth based on level
      var taxRate = wealthLevel === 'rich' ? 0.05
        : wealthLevel === 'wealthy' ? 0.03
        : 0.01;

      var imputedWealth = population * (
        wealthLevel === 'rich' ? 100 :
        wealthLevel === 'wealthy' ? 50 :
        20
      );

      var taxAmount = Math.round(imputedWealth * taxRate * 100) / 100;
      if (taxAmount <= 0) continue;

      // Find faction that owns this settlement
      var factionResult = await db.query(
        `SELECT id, wealth FROM factions
         WHERE world_id = $1 AND headquarters_id = $2
         LIMIT 1`,
        [this.worldId, settlement.id]
      );

      if (factionResult.rows.length > 0) {
        var faction = factionResult.rows[0];
        await db.query(
          'UPDATE factions SET wealth = wealth + $1, updated_at = NOW() WHERE id = $2',
          [taxAmount, faction.id]
        );
      }

      totalCollected += taxAmount;
      details.push({
        settlementId: settlement.id,
        name: settlement.name,
        taxRate: taxRate,
        amount: taxAmount,
        factionId: factionResult.rows.length > 0 ? factionResult.rows[0].id : null,
      });
    }

    console.log(
      '[EconomyEngine:' + this.worldId + '] Taxation collected ' + totalCollected +
      ' gold from ' + details.length + ' settlements'
    );

    return { collected: totalCollected, settlements: details.length, details: details };
  }

  /**
   * Returns current market prices for all items in a settlement.
   * Results are cached for CACHE_TTL milliseconds.
   *
   * @param {string} settlementId - UUID of the settlement
   * @returns {Promise<Array<{itemId: string, itemName: string, basePrice: number, finalPrice: number}>>}
   */
  async getMarketPrices(settlementId) {
    var cacheKey = 'market_' + settlementId;
    var now = Date.now();

    if (this._cache[cacheKey] && (now - this._cacheTimestamp) < this.CACHE_TTL) {
      return this._cache[cacheKey];
    }

    var itemsResult = await db.query(
      'SELECT id, name, type, value FROM items WHERE world_id = $1 ORDER BY name ASC',
      [this.worldId]
    );

    var prices = [];
    for (var i = 0; i < itemsResult.rows.length; i++) {
      var item = itemsResult.rows[i];
      var priceData = await this.calculatePrice(item.id, settlementId);
      prices.push({
        itemId: item.id,
        itemName: item.name,
        basePrice: priceData.basePrice,
        finalPrice: priceData.finalPrice,
      });
    }

    this._cache[cacheKey] = prices;
    this._cacheTimestamp = now;

    return prices;
  }
}

module.exports = EconomyEngine;