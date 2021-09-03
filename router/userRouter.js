const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

//post request to create a new account
router.post("/signup", (req, resp) => {
    console.log(req.body);
    resp.status(200);
    resp.send({ "Status code 200":"Account created!"});
});

router.get("/signup", (req, resp) => {
    resp.send("working");
});

// login and logout uses post method 
router.post("/login", (req, resp) => {
    console.log(req.body);
    resp.status(200);
    resp.send({ "Status code 200":"Account created!"});
});


module.exports = router;
