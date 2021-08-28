const express = require("express");
const db = require("../db/index");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const app = express();
const itemRouter = require("../router/itemRouter");
app.use(cors());
app.use(morgan("combined"));
//TODO: price suggestions active. submit a price suggestion. create user, user login
var environment = process.env.NODE_ENV || "development";

if (environment.trim() == "development") { // double equal sign is to way to compare strings, need to trim the string for extra whitespace
    app.use("/api", itemRouter);
    app.get("/test", (req, resp) => {
        // console.log();
        resp.sendFile(path.join(__dirname, "/../db/mockdata.json"));
    });

    app.get("/mesomarket", (req, resp) => {
        // console.log();
        resp.sendFile(path.join(__dirname, "/../db/mesomarket.json"));
    });
} 
else {
    app.get("/test", (req, resp,next) => {
        db.query(
            "SELECT * FROM items",
            (err, res) => {
                if (err) {
                    return next(err);
                }
                resp.send(res.rows);
            },
            (req, resp) => {
                resp.status(404);
                resp.send("database error");
            }
        );
    });

    app.get("/item/:id/img", (req, resp) => {
        db.query(
            "SELECT * FROM items WHERE price= " + req.params.price,
            (err, res) => {
                if (err) {
                    resp.status(404);
                    resp.send("Error!");
                }
                //if there is no item in database
                else if (res.rows.length == 0) {
                    resp.status(200);
                    resp.send("nothing!");
                }
                //check if no entry for img path in the database
                else if (res.rows[0]["img_path"] == null) {
                    resp.status(404);
                    resp.send("Internal Database Error!");
                } else {
                    console.log(res.rows);
                    console.log(
                        path.join(__dirname, "/../", res.rows[0]["img_path"])
                    );
                    //check if img file exists on filesystem
                    fs.stat(
                        path.join(__dirname, "/../", res.rows[0]["img_path"]),
                        function (err, stat) {
                            if (err == null) {
                                // file does exist
                                var options = {
                                    root: path.join(__dirname + "/../"),
                                    dotfiles: "deny",
                                    headers: {
                                        "x-timestamp": Date.now(),
                                        "x-sent": true,
                                    },
                                };
                                resp.sendFile(
                                    res.rows[0]["img_path"],
                                    options,
                                    (err) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(
                                                "Sent:",
                                                res.rows[0]["name"]
                                            );
                                        }
                                    }
                                );
                            } else if (err.code === "ENOENT") {
                                // file does not exist
                                resp.status(200);
                                resp.send("no img file!");
                            }
                        }
                    );
                }
            }
        );
    });
}

app.listen(4000, (err) => {
    console.log(err);
});
