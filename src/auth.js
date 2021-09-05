const passport = require("passport");
const Strategy = require("passport-local");
const crypto = require("crypto");
const db = require("../db/index");

module.exports = function () {
    passport.use(
        new Strategy(function (username, password, cb) {
            db.query(
                "SELECT * FROM users WHERE username = $1",
                [username],
                function (err, resp) {
                    if (err) {
                        return cb(err);
                    }
                    if (!resp) {
                        return cb(null, false, {
                            message: "Incorrect username or password.",
                        });
                    }
                    //string.normalize() before passing to pbkdf2
                    crypto.pbkdf2(
                        password.normalize(),
                        resp.salt,
                        10000,
                        32,
                        "sha256",
                        function (err, hashedPassword) {
                            if (err) {
                                return cb(err);
                            }
                            if (
                                !crypto.timingSafeEqual(
                                    resp.hashed_password,
                                    hashedPassword
                                )
                            ) {
                                return cb(null, false, {
                                    message: "Incorrect password",
                                });
                            }
                            var user = {
                                id: resp.row[0].user_id.toString(),
                                username: resp.row[0].username,
                                displayName: resp.row[0].name,
                            };
                            return cb(null, user);
                        }
                    );
                }
            );
        })
    );
    passport.serializeUser(function (err, cb) {
        process.nextTick(function () {
            cb(null, { id: user.id, username: user.name });
        });
    });

    passport.deserializeUser(function (err, cb) {
        process.nextTick(function () {
            return cb(null, user);
        });
    });
};
