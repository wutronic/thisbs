const path = require('path');
const dbPath = path.resolve(__dirname, '../guest_credits.sqlite3');

console.log('[DEBUG][init.js] Using SQLite DB at:', dbPath);

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true
});

async function init() {
  const exists = await knex.schema.hasTable('guest_credits');
  if (!exists) {
    await knex.schema.createTable('guest_credits', (table) => {
      table.string('guest_id').primary();
      table.string('date'); // YYYY-MM-DD
      table.integer('credits');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('Created guest_credits table.');
  } else {
    console.log('guest_credits table already exists.');
  }

  // === USER CREDITS TABLE ===
  // Stores daily credits for logged-in users
  const userExists = await knex.schema.hasTable('user_credits');
  if (!userExists) {
    await knex.schema.createTable('user_credits', (table) => {
      table.string('user_id').primary();
      table.string('date'); // YYYY-MM-DD
      table.integer('credits');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('Created user_credits table.');
  } else {
    console.log('user_credits table already exists.');
  }

  // Print all tables in the database for debugging
  const tables = await knex.raw("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('[DEBUG][init.js] Tables in DB:', tables);

  process.exit(0);
}

init(); 