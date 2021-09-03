const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const passport = require('passport');
const crypto = require('crypto');

//post request to create a new account
router.post("/signup", (req, resp, next) => {
    var salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password,salt,1000)

});

router.get("/signup", (req, resp) => {
    resp.send("working");
});

// login and logout uses post method 
router.post("/login",passport.authenticate('local',{failureRedirect:'/login'}), (req, resp) => {
    resp.redirect('/');
});


module.exports = router;
