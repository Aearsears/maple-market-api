const express = require("express");
const db = require("../db/index");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(morgan("combined"));

app.get("/api/test", (req, resp) => {
  db.query("SELECT * FROM items", (err, res) => {
    if (err) {
      return next(err);
    }
    resp.send(res.rows);
  });
});

app.get("/api/img/:price", (req, resp) => {
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
        console.log(path.join(__dirname, "/../", res.rows[0]["img_path"]));
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
              resp.sendFile(res.rows[0]["img_path"], options, (err) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Sent:", res.rows[0]["name"]);
                }
              });
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

app.listen(4000, (err) => {
  console.log(err);
});
