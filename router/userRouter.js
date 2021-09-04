const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const passport = require("passport");
const crypto = require("crypto");
const db = require("../db");

//post request to create a new account
router.post("/signup", (req, resp, next) => {
    var salt = crypto.randomBytes(16);
    crypto.pbkdf2(
        req.body.password,
        salt,
        10000,
        32,
        "sha256",
        function (err, hashedPassword) {
            if (err) {
                return next(err);
            }
            db.query(
                "INSERT INTO users(username, hashed_password,salt,name) VALUES ($1, $2, $3, $4)",
                [req.body.username, hashedPassword, salt, req.body.name],
                (err) => {
                    if (err) {
                        return next(err);
                    }
                    var user = {
                        id: this.lastID.toString(),
                        username: req.body.username,
                        displayName: req.body.name,
                    };
                    req.login(user, (err) => {
                        if (err) {
                            return next(err);
                        }
                        resp.redirect("/");
                    });
                }
            );
        }
    );
});

router.get("/user", (req, resp, next) => {
    if (req.isAuthenticated()) {
        db.query(
            "SELECT rowid AS id, username, name FROM users WHERE rowid = $1",
            [req.user.id],
            (err, row) => {
                if (err) {
                    return next(err);
                }
                var user={
                    id:row.id.toString(),
                    username:row.username,
                    displayname:row.name
                };
                resp.status(200);
                resp.send(user);
            }
        );
    } else {
        resp.redirect("/login");
    }
});

// login and logout uses post method
router.post(
    "/login",
    passport.authenticate("local", {
        successReturnToOrRedirect: "/",
        failureRedirect: "/login",
        failureMessage:true
    }),
    (req, resp) => {
        resp.redirect("/");
    }
);

module.exports = router;
