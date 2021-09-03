const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/item/:id/img", (req, resp) => {
    let json = require(path.join(__dirname, "/../db/mockdata.json"));
    // console.log(json);
    let pth = json[req.params.id]["imgSrc"];
    resp.sendFile(path.join(__dirname, "/../public/img/", pth));
});

router.get("/item/:id", (req, resp) => {
    let json = require(path.join(__dirname, "/../db/mockdata.json"));
    // console.log(json);
    let pth = json[req.params.id];
    resp.send(pth);
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
    console.log(req.body);
    resp.status(200);
    resp.send({ "Status code 200":"Price suggestion created!"});
});

module.exports = router;
