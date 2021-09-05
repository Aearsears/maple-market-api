const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const db = require("../db/index");

module.exports = function () {
    passport.use(
        new LocalStrategy(function (username, password, cb) {
            log.debug("login process:",username);
            db.query(
                "SELECT name,user_id,username FROM users WHERE username = $1",
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
    passport.serializeUser((user, done) => {
        log.debug("serialize ", user);
        process.nextTick( ()=> {
            done(null, user.id);
        });
    });

    passport.deserializeUser((id, done) => {
        log.debug("deserialize ", id);
        process.nextTick( () =>{
            db.query("SELECT username,name FROM users WHERE user_id = $1", [id], (err,row)=>{
                if(err){done(new Error(`User with the id ${id} does not exist.`)); }
                done(null,row);
            })
        });
    });
};
