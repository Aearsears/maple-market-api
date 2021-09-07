require("dotenv").config();
const { Pool } = require("pg");
var environment = process.env.NODE_ENV || "development";
let pool;
if(environment.trim()=="production"){

     pool = new Pool({
        connectionString:process.env.DATABASE_URL,
        ssl:{
            rejectUnauthorized:false
        }
    });
}
else{
     pool = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password:process.env.DB_PASSWORD,
        port:process.env.DB_PORT,
        database:process.env.DB_DATABASE
    })
}
    
module.exports = {
    query: (text, params = undefined, callback) => {
        const start = Date.now();
        return pool.query(text, params, (err,res)=>{
          const duration = Date.now()-start;
          console.log('[LOG]Executed query',{text,duration});
          callback(err,res);
        });
    },
};
