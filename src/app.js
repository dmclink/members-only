const express = require('express');
const path = require('path');
const pool = require('./config/db.js');
const db = require('./db/queries.js');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { truncateString } = require('./lib/stringUtils.js');

const MAX_TRUNC_STRING_LENGTH = 10;

require('./db/init.js');

const { hashPassword, generateSalt, checkAuth, checkAdmin } = require('./lib/authUtils.js');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
	session({
		store: new pgSession({
			pool: pool,
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

app.get('/home', checkAuth, async (req, res) => {
	const result = await db.getAllMessagesWithClubCode();
	const messages = result.rows;
	console.log('USER CLUB CODE:', req.user.club_code);
	console.log(messages);
	//TODO: order by timestamp most recent
	//TODO: filter messages by club code dont want to send to client what they aren't supposed to see
	res.render('home', { username: req.user.username, messages });
});

app.post('/message/create', checkAuth, async (req, res) => {
	const userId = req.user.id;
	const message = req.body.new_message;

	await db.insertNewMessage(userId, message);

	res.redirect('/home');
});

app.listen(3000, 'localhost', () => console.log('listening on 3000'));
