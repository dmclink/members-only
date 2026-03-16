const express = require('express');
const path = require('path');
const db = require('./config/db.js');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

require('./db/init.js');

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

app.use(express.json());
app.use(express.urlencoded());

const authRouter = require('./routes/auth.js');
app.use('/auth', authRouter);

app.get('/', (req, res) =>
	res.send('<h1>Hello World</h1><p>welcome to the clubhouse</p><p>Go to <a href="/auth/login">login</a>'),
);

function checkAuth(req, res, next) {
	if (!req.isAuthenticated()) {
		res.redirect('/auth/login');
		return;
	}
	next();
}

function checkAdmin(req, res, next) {
	if (!req.user.admin) {
		res.redirect('/auth/login');
		return;
	}
	next();
}

app.get('/home', checkAuth, (req, res) => res.render('home', { username: req.user.username }));

app.post('/message/create', checkAuth, (req, res) => {
	const username = req.user.username;
	const message = req.body.new_message;

	db.query('INSERT INTO messages (user_id, content, time) VALUES ($1, $2, $3)');

	res.redirect('/home');
});

app.listen(3000, 'localhost', () => console.log('listening on 3000'));
