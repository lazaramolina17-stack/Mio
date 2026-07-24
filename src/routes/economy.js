const { Router } = require('express');
const Joi = require('joi');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');
const EconomyEngine = require('../services/EconomyEngine');

const router = Router();

// Global market cache (simple object, 30s TTL)
var marketCache = {};
var marketCacheTimestamps = {};

/**
 * Middleware that verifies the user belongs to the target world.
 * Sets req.worldMember and req.worldId.
 */
function requireWorldMember(req, res, next) {
  var worldId = req.params.worldId;
  db.query(
    'SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2',
    [worldId, req.user.id]
  )
    .then(function (result) {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'World not found or access denied' });
      }
      req.worldMember = result.rows[0];
      req.worldId = worldId;
      next();
    })
    .catch(function (err) {
      next(err);
    });
}

/**
 * GET /api/worlds/:worldId/market/:settlementId
 * Returns market prices for all items in a settlement.
 * Cached for 30 seconds in global variable.
 */
router.get('/:worldId/market/:settlementId', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    var settlementId = req.params.settlementId;
    var cacheKey = settlementId;
    var now = Date.now();

    // Check global cache (30s TTL)
    if (marketCache[cacheKey] && (now - (marketCacheTimestamps[cacheKey] || 0)) < 30000) {
      return res.json({ market: marketCache[cacheKey], cached: true });
    }

    var engine = new EconomyEngine(req.worldId);
    var prices = await engine.getMarketPrices(settlementId);

    // Update global cache
    marketCache[cacheKey] = prices;
    marketCacheTimestamps[cacheKey] = now;

    res.json({ market: prices, cached: false });
  } catch (err) {
    next(err);
  }
});

const buySchema = Joi.object({
  itemId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).max(100).default(1),
});

/**
 * POST /api/worlds/:worldId/market/:settlementId/buy
 * Buys an item from the settlement's market.
 * Validates stock, calculates price, deducts gold, adds to inventory.
 */
router.post('/:worldId/market/:settlementId/buy', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    var data = await buySchema.validateAsync(req.body);
    var settlementId = req.params.settlementId;
    var quantity = data.quantity;
    var itemId = data.itemId;

    // Verify settlement exists
    var settlementResult = await db.query(
      'SELECT id, name FROM settlements WHERE id = $1 AND world_id = $2',
      [settlementId, req.worldId]
    );
    if (settlementResult.rows.length === 0) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Get player inventory to check gold
    var playerResult = await db.query(
      `SELECT id, quantity FROM inventories
       WHERE owner_type = 'player'
         AND owner_id = $1
         AND item_id IN (
           SELECT id FROM items WHERE world_id = $2 AND type = 'currency'
         )
       LIMIT 1`,
      [req.user.id, req.worldId]
    );
    var playerGold = playerResult.rows.length > 0
      ? parseInt(playerResult.rows[0].quantity, 10)
      : 0;

    // Calculate price
    var engine = new EconomyEngine(req.worldId);
    var priceData = await engine.calculatePrice(itemId, settlementId);
    var unitPrice = priceData.finalPrice;
    var totalCost = Math.round(unitPrice * quantity * 100) / 100;

    if (totalCost <= 0) {
      return res.status(400).json({ error: 'Invalid item price' });
    }

    if (playerGold < totalCost) {
      return res.status(400).json({
        error: 'Insufficient gold',
        required: totalCost,
        available: playerGold,
      });
    }

    // Check settlement stock
    var stockResult = await db.query(
      `SELECT id, quantity FROM inventories
       WHERE owner_type = 'settlement'
         AND owner_id = $1
         AND item_id = $2`,
      [settlementId, itemId]
    );
    if (stockResult.rows.length === 0 || parseInt(stockResult.rows[0].quantity, 10) < quantity) {
      return res.status(400).json({ error: 'Insufficient stock in settlement' });
    }

    // Deduct from settlement inventory
    var stockRow = stockResult.rows[0];
    var newStockQty = parseInt(stockRow.quantity, 10) - quantity;
    if (newStockQty <= 0) {
      await db.query('DELETE FROM inventories WHERE id = $1', [stockRow.id]);
    } else {
      await db.query('UPDATE inventories SET quantity = $1 WHERE id = $2', [newStockQty, stockRow.id]);
    }

    // Deduct gold from player
    if (playerResult.rows.length > 0) {
      var newGold = playerGold - totalCost;
      if (newGold <= 0) {
        await db.query('DELETE FROM inventories WHERE id = $1', [playerResult.rows[0].id]);
      } else {
        await db.query('UPDATE inventories SET quantity = $1 WHERE id = $2', [newGold, playerResult.rows[0].id]);
      }
    }

    // Add item to player inventory
    var existingPlayerItem = await db.query(
      `SELECT id, quantity FROM inventories
       WHERE owner_type = 'player'
         AND owner_id = $1
         AND item_id = $2`,
      [req.user.id, itemId]
    );

    if (existingPlayerItem.rows.length > 0) {
      await db.query(
        'UPDATE inventories SET quantity = quantity + $1 WHERE id = $2',
        [quantity, existingPlayerItem.rows[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO inventories (item_id, owner_type, owner_id, quantity)
         VALUES ($1, 'player', $2, $3)`,
        [itemId, req.user.id, quantity]
      );
    }

    res.json({
      success: true,
      itemId: itemId,
      quantity: quantity,
      unitPrice: unitPrice,
      totalCost: totalCost,
    });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: 'ValidationError', details: err.details.map(function (d) { return d.message; }) });
    }
    next(err);
  }
});

const sellSchema = Joi.object({
  itemId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).max(100).default(1),
});

/**
 * POST /api/worlds/:worldId/market/:settlementId/sell
 * Sells an item to the settlement's market.
 * Validates player has the item, pays gold, removes from inventory.
 */
router.post('/:worldId/market/:settlementId/sell', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    var data = await sellSchema.validateAsync(req.body);
    var settlementId = req.params.settlementId;
    var quantity = data.quantity;
    var itemId = data.itemId;

    // Verify settlement exists
    var settlementResult = await db.query(
      'SELECT id, name FROM settlements WHERE id = $1 AND world_id = $2',
      [settlementId, req.worldId]
    );
    if (settlementResult.rows.length === 0) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Check if player has the item
    var playerItem = await db.query(
      `SELECT id, quantity FROM inventories
       WHERE owner_type = 'player'
         AND owner_id = $1
         AND item_id = $2`,
      [req.user.id, itemId]
    );
    if (playerItem.rows.length === 0 || parseInt(playerItem.rows[0].quantity, 10) < quantity) {
      return res.status(400).json({ error: 'You do not have enough of this item' });
    }

    // Calculate sell price (60% of buy price, simulating merchant margin)
    var engine = new EconomyEngine(req.worldId);
    var priceData = await engine.calculatePrice(itemId, settlementId);
    var unitPrice = Math.round(priceData.finalPrice * 0.6 * 100) / 100;
    var totalPayment = Math.round(unitPrice * quantity * 100) / 100;

    // Remove from player inventory
    var row = playerItem.rows[0];
    var newQty = parseInt(row.quantity, 10) - quantity;
    if (newQty <= 0) {
      await db.query('DELETE FROM inventories WHERE id = $1', [row.id]);
    } else {
      await db.query('UPDATE inventories SET quantity = $1 WHERE id = $2', [newQty, row.id]);
    }

    // Add item to settlement inventory
    var existingSettlementItem = await db.query(
      `SELECT id, quantity FROM inventories
       WHERE owner_type = 'settlement'
         AND owner_id = $1
         AND item_id = $2`,
      [settlementId, itemId]
    );

    if (existingSettlementItem.rows.length > 0) {
      await db.query(
        'UPDATE inventories SET quantity = quantity + $1 WHERE id = $2',
        [quantity, existingSettlementItem.rows[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO inventories (item_id, owner_type, owner_id, quantity)
         VALUES ($1, 'settlement', $2, $3)`,
        [itemId, settlementId, quantity]
      );
    }

    // Pay gold to player (add to or create currency inventory)
    var existingGold = await db.query(
      `SELECT id, quantity FROM inventories
       WHERE owner_type = 'player'
         AND owner_id = $1
         AND item_id IN (
           SELECT id FROM items WHERE world_id = $2 AND type = 'currency'
         )
       LIMIT 1`,
      [req.user.id, req.worldId]
    );

    if (existingGold.rows.length > 0) {
      await db.query(
        'UPDATE inventories SET quantity = quantity + $1 WHERE id = $2',
        [totalPayment, existingGold.rows[0].id]
      );
    } else {
      // Find a currency item to use as gold
      var currencyItem = await db.query(
        "SELECT id FROM items WHERE world_id = $1 AND type = 'currency' LIMIT 1",
        [req.worldId]
      );
      if (currencyItem.rows.length > 0) {
        await db.query(
          `INSERT INTO inventories (item_id, owner_type, owner_id, quantity)
           VALUES ($1, 'player', $2, $3)`,
          [currencyItem.rows[0].id, req.user.id, totalPayment]
        );
      }
    }

    res.json({
      success: true,
      itemId: itemId,
      quantity: quantity,
      unitPrice: unitPrice,
      totalPayment: totalPayment,
    });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: 'ValidationError', details: err.details.map(function (d) { return d.message; }) });
    }
    next(err);
  }
});

module.exports = router;