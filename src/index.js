const express = require('express');
const db = require('../db/index')
const cors = require('cors')
const morgan = require('morgan');

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

app.listen(4000, (err)=>{
    console.log(err);
});