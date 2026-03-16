const passport = require('passport');
const db = require('../db/queries.js');
const { generateSalt, hashPassword } = require('../lib/authUtils.js');

const { Router } = require('express');

const router = new Router();

router.get('/login', (req, res, next) => {
	res.render('login', { messages: req.session.messages });
});

router.get('/logout', (req, res) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect('/auth/login');
	});
});

router.post(
	'/login/password',
	passport.authenticate('local', { successRedirect: '/home', failureRedirect: '/auth/login', failureMessage: true }),
);

router.get('/register', (req, res) => res.render('register'));
router.post(
	'/register',
	async (req, res, next) => {
		const password = req.body.password;
		const username = req.body.username;

		try {
			const result = await db.getUserByUsername(username);
			const exists = result.rows[0].user_exists;
			if (exists) {
				throw new Error(`user with username: ${username} already exists`);
			}

			const salt = generateSalt();
			const hashed_password = await hashPassword(password, salt);

			await db.insertNewUser(username, hashed_password, salt);

			next();
		} catch (err) {
			console.error(err);
			next(err);
		}
	},
	(req, res) => res.redirect('/auth/login'),
);

module.exports = router;
