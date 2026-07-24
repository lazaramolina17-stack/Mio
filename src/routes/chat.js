const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');

const router = Router();

function requireWorldMember(req, res, next) {
  db.query(
    'SELECT role FROM world_members WHERE world_id = $1 AND user_id = $2',
    [req.params.worldId, req.user.id]
  )
    .then(function (result) {
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'World not found or access denied' });
      }
      req.worldMember = result.rows[0];
      next();
    })
    .catch(function (err) {
      next(err);
    });
}

router.get('/:worldId/chat', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before;

    let queryText = 'SELECT id, user_id, username, message, type, created_at FROM chat_messages WHERE world_id = $1';
    const params = [req.params.worldId];

    if (before) {
      queryText += ' AND created_at < $2';
      params.push(before);
    }

    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await db.query(queryText, params);
    res.json({ messages: result.rows.reverse() });
  } catch (err) {
    next(err);
  }
});

router.post('/:worldId/chat', authenticate, requireWorldMember, async function (req, res, next) {
  try {
    const message = req.body.message;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await db.query(
      'INSERT INTO chat_messages (world_id, user_id, username, message, type) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, username, message, type, created_at',
      [req.params.worldId, req.user.id, req.user.username, message.trim().substring(0, 1000), req.body.type || 'general']
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
