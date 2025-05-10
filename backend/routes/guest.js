const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const knex = require('../db/knex');

// === CREDIT LIMIT CONFIGURATION ===
// Adjust these values to change daily credit limits for guests and logged-in users.
const GUEST_CREDITS_PER_DAY = 6; // Daily credits for guests
const USER_CREDITS_PER_DAY = 20; // Daily credits for logged-in users (used in user_credits logic)

function getTodayString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

// GET /api/guest-id
router.get('/guest-id', (req, res) => {
  let guestId = req.cookies.guest_id;
  if (!guestId) {
    guestId = uuidv4();
    res.cookie('guest_id', guestId, {
      httpOnly: false, // Accessible to JS
      sameSite: 'Lax',
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
  }
  res.json({ guest_id: guestId });
});

// GET /api/guest-credit (peek, no decrement)
router.get('/guest-credit', async (req, res) => {
  const guestId = req.cookies.guest_id || req.query.guest_id;
  if (!guestId) {
    console.log('[DEBUG] GET /api/guest-credit: Missing guest_id');
    return res.status(400).json({ error: 'Missing guest_id' });
  }
  const today = getTodayString();
  let record = await knex('guest_credits').where({ guest_id: guestId }).first();
  if (!record || record.date !== today) {
    // Reset credits for new day or create new record
    await knex('guest_credits').insert({
      guest_id: guestId,
      date: today,
      credits: GUEST_CREDITS_PER_DAY,
      created_at: new Date()
    }).onConflict('guest_id').merge({ date: today, credits: GUEST_CREDITS_PER_DAY });
    record = { guest_id: guestId, date: today, credits: GUEST_CREDITS_PER_DAY };
  }
  console.log(`[DEBUG] GET /api/guest-credit: guest_id=${guestId}, credits=${record.credits}`);
  res.json({ credits: record.credits });
});

// POST /api/guest-credit (decrement)
router.post('/guest-credit', async (req, res) => {
  const guestId = req.cookies.guest_id || req.body.guest_id;
  if (!guestId) {
    console.log('[DEBUG] POST /api/guest-credit: Missing guest_id');
    return res.status(400).json({ error: 'Missing guest_id' });
  }
  const today = getTodayString();
  let record = await knex('guest_credits').where({ guest_id: guestId }).first();
  if (!record || record.date !== today) {
    // Reset credits for new day or create new record
    await knex('guest_credits').insert({
      guest_id: guestId,
      date: today,
      credits: GUEST_CREDITS_PER_DAY,
      created_at: new Date()
    }).onConflict('guest_id').merge({ date: today, credits: GUEST_CREDITS_PER_DAY });
    record = { guest_id: guestId, date: today, credits: GUEST_CREDITS_PER_DAY };
  }
  let credits = record.credits;
  if (credits <= 0) {
    console.log(`[DEBUG] POST /api/guest-credit: guest_id=${guestId}, already at 0 credits`);
    return res.json({ allowed: false, credits: 0 });
  }
  credits -= 1;
  await knex('guest_credits').where({ guest_id: guestId }).update({ credits });
  console.log(`[DEBUG] POST /api/guest-credit: guest_id=${guestId}, credits_after=${credits}`);
  res.json({ allowed: true, credits });
});

// GET /api/debug-guest-credits (debug only)
router.get('/debug-guest-credits', async (req, res) => {
  const all = await knex('guest_credits').select();
  res.json(all);
});

module.exports = router; 