const express = require('express');
const db = require('../db/index')
const cors = require('cors')
const morgan = require('morgan');
const path = require('path');

const app = express();
app.use(cors());
app.use(morgan('combined'));

app.get('/api/test',(req,resp)=>{
    db.query("SELECT * FROM items",(err,res)=>{
        if(err){
            return next(err);
        }
        resp.send(res.rows);
    })
});

app.get('/api/img/:price',(req,resp)=>{
    db.query("SELECT * FROM items WHERE price= "+ req.params.price,(err,res)=>{
        if(err){
            resp.status(404);
            resp.send("Error!");
        }
        if(res.rows.length==0){
            resp.status(200);
            resp.send("nothing!");
            
        }
        // console.log(res.rows['img_path']);
        // resp.send(res.rows[0]['img_path']);
        var options = {
            root: path.join(__dirname+'/../'),
            dotfiles: 'deny',
            headers: {
              'x-timestamp': Date.now(),
              'x-sent': true
            }
          }
        resp.sendFile(res.rows[0]['img_path'],options,(err)=>{
            if (err) {
                console.log(err);
              } else {
                console.log('Sent:', res.rows[0]['name'])
              }
        });
    })
});

app.listen(4000, (err)=>{
    console.log(err);
});