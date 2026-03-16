//all functions related to login queries go here
/*
const DB_pool = require('../config/DB_config');

async function loginUser(uname, pass){

    const loginQuery = 'SELECT FROM public.tbl_users WHERE fld_u_username = $1';
    const queryValues = [uname];

    try {
        const result = await DB_pool.query(loginQuery, queryValues);

        if (result.rows.length > 0) {
            console.log('User found:', result.rows[0]);
        } else {
            console.log('No user with that name found.');
        }
    } catch (err) {
        console.error('Error executing query', err);
        res.redirect('/login');
    }
}
module.exports = {
    loginUser
};
*/