//const express = require('express');
//const {Client}=require('pg')
//const app=express()
//app.use(express.json())
require('dotenv').config();

const { Pool } = require('pg');

//connection info
//consider creating environment variables for this
const DB_pool = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: 5432,
        password: process.env.DB_PASS,
        database: process.env.DB_DB
});

module.exports = DB_pool;
