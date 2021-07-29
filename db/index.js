const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: 8888,
  })

  module.exports ={
      query:(text, params=undefined, callback) => {
        return pool.query(text,params, callback);
      }
  }