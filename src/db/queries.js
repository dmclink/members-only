const db = require('../config/db.js');

function getUserById(userId) {
	return db.query('SELECT * FROM users WHERE id = $1', [userId]);
}

function getUserByUsername(username) {
	const query = `SELECT * FROM users WHERE username = $1`;
	const values = [username];

	return db.query(query, values);
}

function usernameAlreadyExists(username) {
	const query = `
        SELECT EXISTS (
            SELECT 1 FROM users WHERE username = $1
        ) AS user_exists;
    `;
	const values = [username];

	return db.query(query, values);
}

function insertNewUser(username, hashed_password, salt) {
	const query = `
        INSERT INTO users 
            (username, hashed_password, salt, club_code, admin)
        VALUES 
            ($1, $2, $3, $4, $5)
    `;
	const values = [username, hashed_password, salt, '', false];

	return db.query(query, values);
}

function insertNewMessage(userId, content) {
	return db.query('INSERT INTO messages (user_id, message, timestamp) VALUES ($1, $2, $3)', [
		userId,
		content,
		new Date(),
	]);
}

function getAllMessagesWithClubCode() {
	const query = `
        SELECT username, club_code, message, timestamp 
        FROM messages
        JOIN users
        ON users.id = messages.user_id
    `;

	return db.query(query);
}

module.exports = {
	getUserById,
	getUserByUsername,
	insertNewUser,
	insertNewMessage,
	usernameAlreadyExists,
	getAllMessagesWithClubCode,
};
