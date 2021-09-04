const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized:false
    }
});

module.exports = {
    query: (text, params = undefined, callback) => {
        const start = Date.now();
        return pool.query(text, params, (err,res)=>{
          const duration = Date.now()-start;
          console.log('[LOG]Executed query',{text,duration,rows:res.rowCount});
          callback(err,res);
        });
    },
};
