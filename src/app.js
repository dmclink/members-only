const express = require('express');
const path = require('path');
const db = require('./config/db.js');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const { hashPassword, generateSalt } = require('./lib/authUtils.js');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
	session({
		store: new pgSession({
			pool: db,
			createTableIfMissing: true,
		}),
		secret: process.env.EXPRESS_SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
	}),
);

const passport = require('./config/passport.js');
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	next();
});

app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => res.send('<h1>Hello World</h1>'));
app.get('/login', (req, res, next) => {
	res.render('login', { messages: req.session.messages });
});

app.get('/logout', (req, res) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect('/login');
	});
});

app.post(
	'/login/password',
	passport.authenticate('local', { successRedirect: '/home', failureRedirect: '/login', failureMessage: true }),
);

app.get('/home', (req, res) => res.render('home'));

app.get('/register', (req, res) => res.render('register'));
app.post(
	'/register',
	async (req, res, next) => {
		const password = req.body.password;
		const username = req.body.username;
		const query = `
			SELECT EXISTS (
				SELECT 1 FROM users WHERE username = $1
			) AS user_exists;
		`;
		const values = [username];

		try {
			const result = await db.query(query, values);
			const exists = result.rows[0].user_exists;
			if (exists) {
				throw new Error(`user with username: ${username} already exists`);
			}

			const salt = generateSalt();
			const hashed_password = await hashPassword(password, salt);

			await db.query(
				'INSERT INTO users (username, hashed_password, salt, club_code, admin) VALUES ($1, $2, $3, $4, $5)',
				[username, hashed_password, salt, '', false],
			);

			next();
		} catch (err) {
			console.error(err);
			next(err);
		}
	},
	(req, res) => res.redirect('/login'),
);

app.listen(3000, 'localhost', () => console.log('listening on 3000'));
