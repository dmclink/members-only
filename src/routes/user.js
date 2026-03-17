const { Router } = require('express');
const { hashPassword, generateSalt, checkAuth, checkAdmin, isAdmin, validateUserPass } = require('../lib/authUtils.js');
const { truncateString } = require('../lib/stringUtils.js');
const db = require('../db/queries.js');

const MAX_CLUB_CODE_LENGTH = 255;

const router = new Router();

router.get('/', (req, res) => {
	res.render('user', { username: req.user.username, club_code: req.user.club_code });
});

router.post('/new-password', async (req, res) => {
	const previousPassword = req.body.previous_password;
	const newPassword = req.body.current_password;
	const confirmPassword = req.body.confirm_password;

	const isValid = await validateUserPass(req, previousPassword);

	if (!isValid) {
		res.render('user', {
			username: req.user.username,
			club_code: req.user.club_code,
			passwordError: 'Previous password does not match!',
		});
		return;
	}

	const confirmationPasswordMatches = newPassword === confirmPassword;
	if (!confirmationPasswordMatches) {
		res.render('user', {
			username: req.user.username,
			club_code: req.user.club_code,
			passwordError: "Your new password and confirmation don't match!",
		});
		return;
	}

	const newHashedPassword = await hashPassword(newPassword, req.user.salt);

	await db.updatePassword(req.user.id, newHashedPassword);

	res.redirect('/user');
});

router.post('/new-club-code', async (req, res) => {
	const newClubCode = truncateString(req.body.club_code, MAX_CLUB_CODE_LENGTH);

	await db.updateClubCode(req.user.id, newClubCode);

	res.redirect('/user');
});

module.exports = router;
