const express = require('express');
const router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
const db = require('../db');
const auth = require('../src/auth');
const authcookies = require('../src/auth-cookies');

// post request to create a new account
router.post('/signup', (req, resp, next) => {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
        req.body.password,
        salt,
        10000,
        32,
        'sha256',
        function (err, hashedPassword) {
            if (err) {
                return next(err);
            }
            db.query(
                'INSERT INTO users(username, hashed_password,salt,name) VALUES ($1, $2, $3, $4) RETURNING user_id',
                [req.body.username, hashedPassword, salt, req.body.name],
                (err, result) => {
                    if (err) {
                        console.log(err);
                        resp.status(401);
                        resp.send(err.detail);
                    }
                    else {
                        resp.status(200);
                        resp.send('User created!');
                    }
                }
            );
        }
    );
});

router.get('/user', async (req, resp, next) => {
    try {
        const session = await auth.getLoginSession(req);
        console.log(session);
        db.query(
            'SELECT user_id, username, name FROM users WHERE user_id = $1',
            [session.id],
            (err, result) => {
                if (err) {
                    console.log('get user route error');
                    console.log(err);
                    return next(err);
                }
                console.log(result);
                const user = {
                    id: result.rows[0].user_id.toString(),
                    username: result.rows[0].username,
                    displayname: result.rows[0].name
                };
                console.log(user);
                resp.status(200);
                resp.send(user);
            }
        );
    }
    catch (error) {
        console.log(error);
        resp.status(500);
        resp.send('Authentication token is invalid, please login');
    }
    // if (req.isAuthenticated()) {
    //     db.query(
    //         "SELECT user_id, username, name FROM users WHERE user_id = $1",
    //         [req.user.id],
    //         (err, row) => {
    //             if (err) {
    //                 console.log("get user route error");
    //                 console.log(err);
    //                 return next(err);
    //             }
    //             var user = {
    //                 id: row[0].user_id.toString(),
    //                 username: row[0].username,
    //                 displayname: row[0].name,
    //             };
    //             resp.status(200);
    //             resp.send(user);
    //         }
    //     );
    // } else {
    //     resp.redirect("https://maplemarket.herokuapp.com/login");
    // }
});

// login and logout uses post method
router.post('/login', (req, resp, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err) {
                return next(err);
            }
            if (!user) {
                resp.status(401);
                resp.end(info.message);
                return;
            }
            console.log(req.body);
            const userReq = user;
            const session = { ...userReq };
            console.log(session);
            await auth.setLoginSession(resp, session);
            resp.status(200);
            resp.send('Login success!');
        }
        catch (error) {
            throw new Error(error);
        }
    })(req, resp, next);
});

router.post('/logout', (req, resp, next) => {
    try {
        console.log(req.body);
        authcookies.removeTokenCookie(resp);

        resp.status(200);
        resp.send('Logout success!');
    }
    catch (error) {
        console.log(error);
        resp.status(401).send(error);
    }
});

module.exports = router;
