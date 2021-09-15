const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db/index');
const auth = require('../src/auth');

router.get('/item/:id/img', (req, resp) => {
    db.query(
        'SELECT * FROM items WHERE id= $1',
        [req.params.id],
        (err, result) => {
            if (err) {
                resp.status(404);
                resp.send('Error!');
            } else if (result.rows.length == 0) {
                // if there is no item in database
                resp.status(200);
                resp.send(`Item with id ${req.params.id} does not exist.`);
            } else if (result.rows[0].imgsrc == null) {
                // check if no entry for img path in the database
                resp.status(404);
                resp.send('Internal Database Error!');
            } else {
                console.log(result.rows);
                console.log(
                    path.join(
                        __dirname,
                        '/../',
                        'public/img/',
                        result.rows[0].imgsrc
                    )
                );
                // check if img file exists on filesystem
                fs.stat(
                    path.join(
                        __dirname,
                        '/../',
                        'public/img/',
                        result.rows[0].imgsrc
                    ),
                    function (err, stat) {
                        if (err == null) {
                            // file does exist
                            const options = {
                                root: path.join(
                                    __dirname,
                                    '/../',
                                    'public/img/'
                                ),
                                dotfiles: 'deny',
                                headers: {
                                    'x-timestamp': Date.now(),
                                    'x-sent': true,
                                },
                            };
                            resp.sendFile(
                                result.rows[0].imgsrc,
                                options,
                                (err) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(
                                            'Sent:',
                                            result.rows[0].name
                                        );
                                    }
                                }
                            );
                        } else if (err.code === 'ENOENT') {
                            // file does not exist
                            resp.status(200);
                            resp.send('No img file!');
                        }
                    }
                );
            }
        }
    );
});

router.get('/item/:id', (req, resp) => {
    db.query(
        'SELECT * FROM items WHERE id= $1',
        [req.params.id],
        (err, result) => {
            if (err) {
                resp.status(404);
                resp.send('Error!');
            } else if (result.rows.length == 0) {
                // if there is no item in database
                resp.status(200);
                resp.send(`Item with id ${req.params.id} does not exist.`);
            } else {
                resp.status(200);
                resp.send(result.rows);
            }
        }
    );
});

router.get('/item/:id/pricehist', (req, resp, next) => {
    const url = path.join(
        __dirname,
        '/../db/historprices/',
        req.params.id + '.json'
    );
    fs.stat(url, function (err, stat) {
        if (err == null) {
            // console.log('File exists');
            resp.sendFile(url);
        } else if (err.code === 'ENOENT') {
            // file does not exist
            resp.send({});
        } else {
            // console.log('Some other error: ', err.code);
            next(err);
        }
    });
});

router.post('/item/pricesuggestion', (req, resp) => {
    // the check for the user having logged in is done on the nextjs by calling getServerSide props. so the user wil already be logged in to access this page and make a price suggestion
    console.log(req.body);
    resp.status(200);
    resp.send({ 'Status code 200': 'Price suggestion created!' });
});

router.get('/item/:id/pricesuggestion', (req, resp, next) => {
    const url = path.join(
        __dirname,
        '/../db/itempricesuggestions/',
        req.params.id + '.json'
    );
    fs.stat(url, function (err, stat) {
        if (err == null) {
            // console.log('File exists');
            resp.sendFile(url);
        } else if (err.code === 'ENOENT') {
            // file does not exist
            resp.send({});
        } else {
            // console.log('Some other error: ', err.code);
            next(err);
        }
    });
});

module.exports = router;
