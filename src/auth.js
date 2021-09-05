const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const db = require("../db/index");

module.exports = function () {
    passport.use(
        new LocalStrategy(function (username, password, cb) {
            console.log("login process:",username);
            db.query(
                "SELECT name,user_id,username FROM users WHERE username = $1",
                [username],
                function (err, resp) {
                    if (err) {
                        console.log(err);
                        return cb(err);
                    }
                    if (!resp) {
                        console.log("Incorrect username");
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
                                console.log(err);
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
        console.log("serialize ", user);
        process.nextTick( ()=> {
            done(null, user.id);
        });
    });

    passport.deserializeUser((id, done) => {
        console.log("deserialize ", id);
        process.nextTick( () =>{
            db.query("SELECT name,user_id,username FROM users WHERE user_id = $1", [id], (err,row)=>{
                if(err){done(new Error(`User with the id ${id} does not exist.`)); }
                done(null,row);
            })
        });
    });
};
