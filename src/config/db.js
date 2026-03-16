const { Pool } = require('pg');
const db = new Pool({
	connectionString: process.env.NEON_DB_CONN_STRING,
});

module.exports = db;
