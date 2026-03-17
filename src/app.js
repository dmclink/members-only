const express = require('express');
const path = require('path');
const pool = require('./config/db.js');
const db = require('./db/queries.js');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { hideString } = require('./lib/stringUtils.js');

const MAX_TRUNC_STRING_LENGTH = 10;

require('./db/init.js');

const { hashPassword, generateSalt, checkAuth, checkAdmin, isAdmin } = require('./lib/authUtils.js');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/', (req, res) => res.render('index'));

const authRouter = require('./routes/auth.js');
app.use('/auth', authRouter);

const messageRouter = require('./routes/message.js');
app.use('/message', messageRouter);

const userRouter = require('./routes/user.js');
app.use('/user', userRouter);

app.get('/home', checkAuth, async (req, res) => {
	const result = await db.getAllMessagesWithClubCode();
	const messages = result.rows;
	const userClubCode = req.user.club_code;

	const canView = (messageClubCode) => {
		return isAdmin(req, res) || messageClubCode === userClubCode;
	};

	// filter messages by club code
	const filteredMessages = messages.map((msg) => {
		msg.timestamp = msg.timestamp.toLocaleString();
		if (!canView(msg.club_code)) {
			return { ...msg, message: hideString(msg.message), username: hideString(msg.username) };
		}

		return msg;
	});

	res.render('home', { username: req.user.username, messages: filteredMessages });
});

app.get('/unauthorized', (req, res) => {
	res.render('unauthorized');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT);
