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
                "INSERT INTO users(username, hashed_password,salt,name) VALUES ($1, $2, $3, $4) RETURNING user_id",
                [req.body.username, hashedPassword, salt, req.body.name],
                (err, result) => {
                    if (err) {
                        return next(err);
                    }
                    var user = {
                        id: result.rows[0].user_id.toString(),
                        username: req.body.username,
                        displayName: req.body.name,
                    };
                    req.login(user, (err) => {
                        if (err) {
                            return next(err);
                        }
                        resp.redirect("https://maplemarket.herokuapp.com");
                    });
                }
            );
        }
    );
});

router.get("/user", (req, resp, next) => {
    if (req.isAuthenticated()) {
        db.query(
            "SELECT user_id, username, name FROM users WHERE user_id = $1",
            [req.user.id],
            (err, row) => {
                if (err) {
                    console.log("get user route error");
                    console.log(err);
                    return next(err);
                }
                var user = {
                    id: row[0].user_id.toString(),
                    username: row[0].username,
                    displayname: row[0].name,
                };
                resp.status(200);
                resp.send(user);
            }
        );
    } else {
        resp.redirect("https://maplemarket.herokuapp.com/login");
    }
});

// login and logout uses post method
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "https://maplemarket.herokuapp.com/login",
        successRedirect: "https://maplemarket.herokuapp.com",
    })
);

module.exports = router;
