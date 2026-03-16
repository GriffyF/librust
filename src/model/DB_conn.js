const DB_pool = require('../config/DB_config');

//connect to DB
async function connectDB(DB_pool){
    try {
        await DB_pool.connect();
        //comment or remove below line after testing
        console.log('Connected to DB.');
    } catch (err) {
        console.error("Error during operation:", err.stack);
    }
}

module.exports = {
    connectDB
};