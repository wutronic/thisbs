const path = require('path');
const dbPath = path.resolve(__dirname, '../guest_credits.sqlite3');

console.log('[DEBUG][knex.js] Using SQLite DB at:', dbPath);

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true
});

module.exports = knex; 