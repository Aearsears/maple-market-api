const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/item/:id/img", (req, resp) => {
    db.query(
        "SELECT * FROM items WHERE id= $1",
        [req.params.id],
        (err, result) => {
            if (err) {
                resp.status(404);
                resp.send("Error!");
            }
            //if there is no item in database
            else if (result.rows.length == 0) {
                resp.status(200);
                resp.send(`Item with id ${req.params.id} does not exist.`);
            }
            //check if no entry for img path in the database
            else if (result.rows[0]["imgsrc"] == null) {
                resp.status(404);
                resp.send("Internal Database Error!");
            } else {
                console.log(result.rows);
                console.log(
                    path.join(
                        __dirname,
                        "/../",
                        "public/img/",
                        result.rows[0]["imgsrc"]
                    )
                );
                //check if img file exists on filesystem
                fs.stat(
                    path.join(
                        __dirname,
                        "/../",
                        "public/img/",
                        result.rows[0]["imgsrc"]
                    ),
                    function (err, stat) {
                        if (err == null) {
                            // file does exist
                            var options = {
                                root: path.join(
                                    __dirname,
                                    "/../",
                                    "public/img/"
                                ),
                                dotfiles: "deny",
                                headers: {
                                    "x-timestamp": Date.now(),
                                    "x-sent": true,
                                },
                            };
                            resp.sendFile(
                                result.rows[0]["imgsrc"],
                                options,
                                (err) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(
                                            "Sent:",
                                            result.rows[0]["name"]
                                        );
                                    }
                                }
                            );
                        } else if (err.code === "ENOENT") {
                            // file does not exist
                            resp.status(200);
                            resp.send("No img file!");
                        }
                    }
                );
            }
        }
    );
});

router.get("/item/:id", (req, resp) => {
    db.query(
        "SELECT * FROM items WHERE id= $1",
        [req.params.id],
        (err, result) => {
            if (err) {
                resp.status(404);
                resp.send("Error!");
            }
            //if there is no item in database
            else if (result.rows.length == 0) {
                resp.status(200);
                resp.send(`Item with id ${req.params.id} does not exist.`);
            } else {
                resp.status(200);
                resp.send(result.rows);
            }
        }
    );
});

router.get("/item/:id/pricehist", (req, resp, next) => {
    let url = path.join(
        __dirname,
        "/../db/historprices/",
        req.params.id + ".json"
    );
    fs.stat(url, function (err, stat) {
        if (err == null) {
            // console.log('File exists');
            resp.sendFile(url);
        } else if (err.code === "ENOENT") {
            // file does not exist
            resp.send({});
        } else {
            // console.log('Some other error: ', err.code);
            next(err);
        }
    });
});

router.post("/item/pricesuggestion", (req, resp) => {
    if (req.isAuthenticated()) {
        console.log(req.body);
        resp.status(200);
        resp.send({ "Status code 200": "Price suggestion created!" });
    } else {
        console.log(req.body);
        resp.status(201);
        resp.send({ "Status code 201": "you need to be logged in!" });
    }
});

module.exports = router;
