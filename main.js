if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const express = require('express');
const path = require('path');
const app = express();
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const cors = require("cors");
//const methodOverride = require('method-override');

const DB_func = require('./src/model/DB_conn');
const routes = require('./src/routes/routes')
const DB_pool = require('./src/config/DB_config');
const { checkAuthenticated } = require('./src/middleware/checkAuth');
const initializePassport = require('./src/config/passport_config');
/*
initializePassport(passport,
    uname => { return users.find(user => user.uname == uname)}
);
*/
const users = [];

const origins = ["https://projectlibrus.com", "https://www.projectlibrus.com", "http://localhost:3000","http://localhost:3005"];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS blocked"))
        }
    }
}));

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/controller', express.static(__dirname + '/src/controller'));
app.use(express.static(path.join(__dirname, '/src/public'), {extensions: ['html'] }));
//app.use(cors({ origin: "https://projectlibrus.com" }));
app.use(express.static('webpage'));
app.use(express.urlencoded({ extended: false }));

//app.use(express.static('public'));

app.use(flash());
app.use(session({
    //change SESSION_SECRET to be randomly generated characters
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
require('./src/config/passport_config');
//app.use(methodOverride('_method'));
//connect to DB

app.use('/private', checkAuthenticated, express.static('private'));

DB_func.connectDB(DB_pool);


//serves index.html to the browser
//when node sees /, it calls routes to serve the appropriate page

app.use('/', routes);



/*
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}
*/


//authenticates users before allowing access to dashboards



//opens up the server
app.listen(process.env.PORT, () => {
    console.log('Server is running on http://localhost:', process.env.PORT);
});
