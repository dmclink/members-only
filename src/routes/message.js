const { Router } = require('express');
const { hashPassword, generateSalt, checkAuth, checkAdmin, isAdmin } = require('../lib/authUtils.js');
const { truncateString } = require('../lib/stringUtils.js');
const db = require('../db/queries.js');

const MAX_MESSAGE_LENGTH = 255;

const router = new Router();

router.post('/create', checkAuth, async (req, res) => {
	const userId = req.user.id;
	const message = truncateString(req.body.new_message.trim(), MAX_MESSAGE_LENGTH);

	await db.insertNewMessage(userId, message);

	res.redirect('/home');
});

router.get('/delete/:id', checkAuth, async (req, res) => {
	const messageId = req.params.id;
	const userId = req.user.id;

	const result = await db.getMessageById(messageId);
	const message = result.rows[0];

	if (!message) {
		res.redirect('/home');
		return;
	}

	const messageIsAuthoredByUser = userId === message.user_id;
	const hasAdminPriv = isAdmin(req, res);
	const canDelete = messageIsAuthoredByUser || hasAdminPriv;

	if (!canDelete) {
		res.redirect('/unauthorized');
		return;
	}

	await db.deleteMessage(messageId);

	res.redirect('/home');
});

module.exports = router;
