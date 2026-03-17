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

function insertNewUser(username, hashed_password, salt, clubCode) {
	const query = `
        INSERT INTO users 
            (username, hashed_password, salt, club_code, admin)
        VALUES 
            ($1, $2, $3, $4, $5)
    `;
	const values = [username, hashed_password, salt, clubCode, false];

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
        SELECT messages.id, username, club_code, message, timestamp 
        FROM messages
        JOIN users
        ON users.id = messages.user_id
        ORDER BY timestamp DESC
    `;

	return db.query(query);
}

function getMessageById(id) {
	const query = `
        SELECT * FROM messages WHERE id = $1
    `;
	const values = [id];

	return db.query(query, values);
}

function deleteMessage(id) {
	const query = `
        DELETE FROM messages WHERE id = $1
    `;
	const values = [id];

	return db.query(query, values);
}

function updatePassword(id, newPasswordHash) {
	const query = `
		UPDATE users
		SET hashed_password = $1
		WHERE id = $2
	`;
	const values = [newPasswordHash, id];

	return db.query(query, values);
}

function updateClubCode(id, newClubCode) {
	const query = `
		UPDATE users
		SET club_code = $1
		WHERE id = $2
	`;
	const values = [newClubCode, id];

	return db.query(query, values);
}

module.exports = {
	getUserById,
	getUserByUsername,
	insertNewUser,
	insertNewMessage,
	usernameAlreadyExists,
	getAllMessagesWithClubCode,
	getMessageById,
	deleteMessage,
	updatePassword,
	updateClubCode,
};
