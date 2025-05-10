var express = require('express');
var router = express.Router();
const knex = require('../db/knex');
const { USER_CREDITS_PER_DAY } = require('./guest'); // Import the variable from guest.js

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

function getTodayString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

// GET /api/user-credit (peek, no decrement)
router.get('/user-credit', async (req, res) => {
  // Assume authentication middleware sets req.user.id
  const userId = req.user && req.user.id;
  if (!userId) {
    console.log('[DEBUG] GET /api/user-credit: Missing user_id');
    return res.status(401).json({ error: 'Missing or unauthorized user_id' });
  }
  const today = getTodayString();
  let record = await knex('user_credits').where({ user_id: userId }).first();
  console.log('[DEBUG] Raw record from DB:', record);

  if (!record || record.date !== today || record.credits === null) {
    try {
      await knex('user_credits').insert({
        user_id: userId,
        date: today,
        credits: USER_CREDITS_PER_DAY,
        created_at: new Date()
      }).onConflict('user_id').merge({ date: today, credits: USER_CREDITS_PER_DAY });
      console.log('[DEBUG] Inserted or merged user_credits row for', userId);
    } catch (err) {
      console.error('[DEBUG] Error inserting/merging user_credits:', err);
    }
    record = await knex('user_credits').where({ user_id: userId }).first();
    console.log('[DEBUG] Post-insert record from DB:', record);
  }

  const allRows = await knex('user_credits').where({ user_id: userId });
  console.log('[DEBUG] All rows for user:', allRows);

  // Extra debugging
  console.log('[DEBUG] Final record before response:', record);
  console.log('[DEBUG] typeof record.credits:', typeof (record && record.credits), 'value:', record && record.credits);

  res.json({ credits: record ? record.credits : null });
});

// POST /api/user-credit (decrement)
router.post('/user-credit', async (req, res) => {
  // Assume authentication middleware sets req.user.id
  const userId = req.user && req.user.id;
  if (!userId) {
    console.log('[DEBUG] POST /api/user-credit: Missing user_id');
    return res.status(401).json({ error: 'Missing or unauthorized user_id' });
  }
  const today = getTodayString();
  let record = await knex('user_credits').where({ user_id: userId }).first();
  if (!record || record.date !== today) {
    // Reset credits for new day or create new record
    await knex('user_credits').insert({
      user_id: userId,
      date: today,
      credits: USER_CREDITS_PER_DAY,
      created_at: new Date()
    }).onConflict('user_id').merge({ date: today, credits: USER_CREDITS_PER_DAY });
    record = { user_id: userId, date: today, credits: USER_CREDITS_PER_DAY };
  }
  let credits = record.credits;
  if (credits <= 0) {
    console.log(`[DEBUG] POST /api/user-credit: user_id=${userId}, already at 0 credits`);
    return res.json({ allowed: false, credits: 0 });
  }
  credits -= 1;
  await knex('user_credits').where({ user_id: userId }).update({ credits });
  console.log(`[DEBUG] POST /api/user-credit: user_id=${userId}, credits_after=${credits}`);
  res.json({ allowed: true, credits });
});

module.exports = router;
