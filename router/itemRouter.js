const express = require('express');
const router = express.Router();
const path = require('path');

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

router.get("/item/:id/pricehist", (req, resp) => {
    resp.sendFile(
        path.join(
            __dirname,
            "/../db/historprices/",
            req.params.id + ".json"
        ),
        function(err){
            resp.send({});
        }
    );
});

module.exports = router;