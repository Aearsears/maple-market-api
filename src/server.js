const express = require('express');
const db = require('../db/index');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const cookieParser = require('cookie-parser');

const environment = process.env.NODE_ENV || 'development';
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1);
const itemRouter = require('../router/itemRouter');
const userRouter = require('../router/userRouter');
const corsOptions = {
    origin: [
        'https://wizardly-bardeen-ddc625.netlify.app',
        'http://localhost:3000'
    ],
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

if (environment.trim() == 'development') {
    // double equal sign is to way to compare strings, need to trim the string for extra whitespace
    require('./auth-passport')(passport);

    app.use(
        session({
            secret: process.env.TOKEN_SECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 1000 * 60 * 60 * 60,
                secure: false
            },
            secure: false,
            httpOnly: false
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/api', itemRouter);
    app.use('/', userRouter);
    const morgan = require('morgan');
    app.use(morgan('combined'));
    app.get('/test', (req, resp) => {
        // console.log();
        resp.sendFile(path.join(__dirname, '/../db/mockdata.json'));
    });

    app.get('/mesomarket', (req, resp) => {
        // console.log();
        resp.sendFile(path.join(__dirname, '/../db/mesomarket.json'));
    });
}
else {
    require('./auth-passport')(passport);
    const sessionConfig = {
        // eslint-disable-next-line new-cap
        store: new pgSession({
            pool: db.getPool(),
            tableName: 'session'
        }),
        name: 'SID',
        secret: process.env.TOKEN_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            samesite: 'None',
            secure: true, // ENABLE ONLY ON HTTPS
            httpOnly: true,
            path: '/'
        }
    };
    app.use(session(sessionConfig));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use('/api', itemRouter);
    app.use('/', userRouter);
    // middleware to catch non existing routes
    app.use(function (err, req, res, next) {
        console.log(err.stack);
        res.status(404);
        res.send('error:page does not exist');
    });

    app.get('/frontpage', (req, resp, next) => {
        db.query(
            'SELECT * FROM items',
            (err, result) => {
                if (err) {
                    return next(err);
                }
                resp.send(result.rows);
            },
            (req, resp) => {
                resp.status(404);
                resp.send('database error');
            }
        );
    });

    app.get('/status', (req, resp) => {
        resp.status(200);
        resp.send('API is online.');
    });
}

app.listen(PORT, (err) => {
    console.log(err);
});
