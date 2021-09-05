const express = require("express");
const db = require("../db/index");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const PORT = process.env.PORT || 4000;
const cors = require("cors");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
const itemRouter = require("../router/itemRouter");
const userRouter = require("../router/userRouter");
// var corsOptions={
//     origin:'https://maplemarket.herokuapp.com',
//     optionsSuccessStatus:200,
//     allowedHeaders:"Origin,X-Requested-With,Content-Type,Accept,Authorization"
// };
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded



var environment = process.env.NODE_ENV || "development";

if (environment.trim() == "development") {
    // double equal sign is to way to compare strings, need to trim the string for extra whitespace
    app.use("/api", itemRouter);
    app.use("/", userRouter);
    const morgan = require("morgan");
    app.use(cors());
    app.use(morgan("combined"));
    app.get("/test", (req, resp) => {
        // console.log();
        resp.sendFile(path.join(__dirname, "/../db/mockdata.json"));
    });

    app.get("/mesomarket", (req, resp) => {
        // console.log();
        resp.sendFile(path.join(__dirname, "/../db/mesomarket.json"));
    });
} else {
    require('./auth')();

    app.use(
        session({
            secret: "keyboard cat",
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 1000 * 60 * 60 * 60,
                secure: true,
            },
        })
    );
    app.use(passport.initialize());
    app.use(passport.authenticate("session"));
    app.use("/api", itemRouter);
    app.use("/", userRouter);
    // middleware to catch non existing routes
    app.use(function(err,req,res,next){
        console.log(err.stack);
        res.status(404);
        res.send("error:page does not exist");
    })

    app.get("/test", (req, resp, next) => {
        db.query(
            "SELECT * FROM items",
            (err, row) => {
                if (err) {
                    return next(err);
                }
                resp.send(row.rows);
            },
            (req, resp) => {
                resp.status(404);
                resp.send("database error");
            }
        );
    });

    app.get("/status", (req, resp) => {
        resp.status(200);
        resp.send("API is online.");
    });

    app.get("/item/:id/img", (req, resp) => {
        db.query(
            "SELECT * FROM items WHERE price= $1",
            [req.params.price],
            (err, row) => {
                if (err) {
                    resp.status(404);
                    resp.send("Error!");
                }
                //if there is no item in database
                else if (row.rows.length == 0) {
                    resp.status(200);
                    resp.send("nothing!");
                }
                //check if no entry for img path in the database
                else if (row.rows[0]["img_path"] == null) {
                    resp.status(404);
                    resp.send("Internal Database Error!");
                } else {
                    console.log(row.rows);
                    console.log(
                        path.join(__dirname, "/../", row.rows[0]["img_path"])
                    );
                    //check if img file exists on filesystem
                    fs.stat(
                        path.join(__dirname, "/../", row.rows[0]["img_path"]),
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
                                    row.rows[0]["img_path"],
                                    options,
                                    (err) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(
                                                "Sent:",
                                                row.rows[0]["name"]
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

app.listen(PORT, (err) => {
    console.log(err);
});
