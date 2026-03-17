const db = require('../config/db.js');
const dbQueries = require('../db/queries.js');
console.log('initializing db');

async function main() {
	try {
		await db.query(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
				username VARCHAR(255) UNIQUE,
				hashed_password VARCHAR(255),
				salt VARCHAR(255),
				club_code VARCHAR(255),
				admin BOOL
			)`);
		await db.query(`
			CREATE TABLE IF NOT EXISTS messages (
				id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
				user_id INTEGER REFERENCES users(id),
				message VARCHAR(255),
				timestamp TIMESTAMP
			)`);

		const result = await dbQueries.usernameAlreadyExists('dmclink');
		const adminExists = result.rows[0].user_exists;

		if (adminExists) {
			await db.query(`
				UPDATE users SET admin = true WHERE username = 'dmclink'
			`);
		}
	} catch (err) {
		console.error(err);
	}
}

main();
