const express = require('express');
const inboxRouter = express.Router();
const { query } = require('../helpers/db');

// get all messages for a user
inboxRouter.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await query(
      'SELECT * FROM inbox WHERE receiver_id = $1 OR sender_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// send a message
inboxRouter.post('/', async (req, res) => {
  const { sender_id, receiver_id, message_text } = req.body;
  try {
    const result = await query(
      'INSERT INTO inbox (sender_id, receiver_id, message_text) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, receiver_id, message_text]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});
// MASHAIR - mark messages as read
inboxRouter.put('/read/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    await query(
      'UPDATE inbox SET read = true WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiverId]
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

module.exports = { inboxRouter };