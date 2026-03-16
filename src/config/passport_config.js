const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const DB_pool = require('./DB_config');

/*
function initialize(passport, getUserByUname) {
    const authenticateUser = async (uname, pass, done) => {
        const user = getUserByUname(uname)
        if (user == null) {
            return done(null, false, { message: 'No user with that username' })
        }

    }

    passport.use(new LocalStrategy({ usernameField: 'uname'},
    authenticateUser))
    passport.serializeUser((user, done) => {})
    passport.deserializeUser((id, done) => {})
}
*/

passport.use(new LocalStrategy(
    { 
        usernameField: 'uname',
        passwordField: 'pass'
     },
    async (username, password, done) => {
        try {
            //find user
            const loginQuery = 'SELECT * FROM tbl_users WHERE fld_u_username = $1';
            const queryValues = [username];

            const result = await DB_pool.query(loginQuery, queryValues);
            const user = result.rows[0];
            
            //const dbUsername = user.fld_u_username.trim();
            //const dbPassword = user.fld_u_password.trim();

            if (!user) {
                return done(null, false, { message: 'User not found' });
            }
            //check pass
            if (password === user.fld_u_password) {
            //if (bcrypt.compare(password, user.fld_u_password)){
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password' });
            }


        } catch (err) {
            return done(err);
        }
    }

));

passport.serializeUser((user, done) => {
    done(null, user.fld_u_username)
});

passport.deserializeUser(async (uname, done) => {
    try {
        const result = await DB_pool.query('SELECT * FROM tbl_users WHERE fld_u_username = $1', [uname]);
        done(null, result.rows[0]);
    } catch (err) {
        done(err);
    }
})

//module.exports = initialize;
