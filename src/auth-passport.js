// const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const db = require("../db/index");

module.exports = function (passport) {
    passport.use(
        "login",
        new LocalStrategy(
            {
                usernameField : "email",
                passwordField : "password",
                passReqToCallback: true,
            },
            function (req, username, password, cb) {
                console.log("login process:", username);
                db.query(
                    "SELECT name,user_id,username,salt,hashed_password FROM users WHERE username = $1",
                    [username],
                    function (err, result) {
                        if (err) {
                            console.log(err);
                            return cb(err);
                        }
                        if (result.rows[0] == null) {
                            console.log("Incorrect username");
                            return cb(null, false, {
                                message: "Incorrect username or password.",
                            });
                        } else {
                            //string.normalize() before passing to pbkdf2
                            crypto.pbkdf2(
                                password.normalize(),
                                result.rows[0].salt,
                                10000,
                                32,
                                "sha256",
                                function (err, hashedPassword) {
                                    if (err) {
                                        console.log(err);
                                        return cb(err);
                                    }
                                    if (
                                        !crypto.timingSafeEqual(
                                            result.rows[0].hashed_password,
                                            hashedPassword
                                        )
                                    ) {
                                        console.log("incorrect password");
                                        return cb(null, false, {
                                            message: "Incorrect password or username.",
                                        });
                                    }
                                    console.log("user "+req.body.username + " has logged in.");
                                    var user = {
                                        id: result.rows[0].user_id.toString(),
                                        username: result.rows[0].username,
                                        displayName: result.rows[0].name,
                                    };
                                    return cb(null, user);
                                }
                            );
                        }
                    }
                );
            }
        )
    );
    passport.serializeUser((user, done) => {
        console.log("serialize ", user);
        process.nextTick(() => {
            done(null, user);
        });
    });

    passport.deserializeUser((user, done) => {
        console.log("deserialize ", user);
        process.nextTick(() => {
            db.query("SELECT name,user_id,username FROM users WHERE user_id = $1", [user.id], (err,results)=>{
                if(err){return done(err); }
                done(null,results.rows[0]);
            })
            // done(null, user);
        });
    });
};
