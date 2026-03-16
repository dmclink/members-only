const db = require('../config/db.js');
console.log('initializing db');

db.query(
	`
CREATE TABLE IF NOT EXISTS users (
	id INTEGER GENERATED ALWAYS AS IDENTITY,
	username VARCHAR(255) UNIQUE,
	hashed_password VARCHAR(255),
	salt VARCHAR(255),
	club_code VARCHAR(255),
	admin BOOL
) 
`,
).catch((err) => console.error(err));
