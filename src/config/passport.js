const passport = require('passport');
const LocalStrategy = require('passport-local');
const db = require('../config/db.js');
const crypto = require('crypto');

const { validatePassword } = require('../lib/authUtils.js');

const verifyCallback = (req, username, password, done) => {
	req.session.messages = [];
	db.query('SELECT * FROM users WHERE username = $1', [username])
		.then((result) => {
			const user = result.rows[0];
			if (!user) {
				return done(null, false, { message: 'Incorrect username or password.' });
			}

			const isValid = validatePassword(password, user.salt, user.hashed_password)
				.then((isValid) => {
					if (isValid) {
						return done(null, user);
					} else {
						return done(null, false, { message: 'Incorrect username or password.' });
					}
				})
				.catch((err) => done(err));
		})
		.catch((err) => done(err));
};
const strategy = new LocalStrategy({ passReqToCallback: true }, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((userId, done) => {
	db.query('SELECT * FROM users WHERE id = $1', [userId])
		.then((result) => {
			const user = result.rows[0];
			done(null, user);
		})
		.catch((err) => {
			done(err);
		});
});

module.exports = passport;
