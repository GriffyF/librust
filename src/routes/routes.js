//sends login page to users when accessing the site
const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const DB_pool = require('../config/DB_config');
//const flash = require('express-flash');
//const session = require('express-session');

const userLogin = require('../model/userLogin');
const { checkAuthenticated } = require('../middleware/checkAuth');
//index routes

router.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
});

router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
})


//login routes

router.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'))
});



router.post('/login', async (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login.html?error=1'
    })(req, res, next);
});

//logout route

router.get('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

//dashboard routes

router.get('/dashboard', checkAuthenticated, (req, res) => {
    if (req.user.fld_u_role === 'Student') {
        //res.sendFile(path.join(__dirname, '../private/dashstu.html'))
        res.redirect('/dashstu');
    }
    else if (req.user.fld_u_role === 'Teacher') {
        //res.sendFile(path.join(__dirname, '../private/dashteach.html'))
        res.redirect('/dashteach');
    }
    else if (req.user.fld_u_role === 'Admin') {
        //res.sendFile(path.join(__dirname, '../private/dashadmin.html'))
        res.redirect('/dashadmin');
    }
    else {
        //res.sendFile(path.join(__dirname, '../public/index.html'))
        res.redirect('/index');
    }
})

router.get('/dashstu', checkAuthenticated, (req, res) => {
    if (req.user.fld_u_role === 'Student') {
        res.sendFile(path.join(__dirname, '../private/dashstu.html'))
    }
    else {
        res.sendFile(path.join(__dirname, '../public/index.html'))
    }
})

router.get('/api/student/checkedOut', checkAuthenticated, async (req, res) => {
	try {
        const rawData = req.user.fld_u_checkedItems || req.user.fld_u_checkeditems;

        if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
            return res.json([]); // Return empty array if user has nothing
        }

        let checkOutIDs;
        if (Array.isArray(rawData)) {
            checkedOutIDs = rawData.map(Number);
        } else if (typeof rawData === 'string') {
            // Handle PG string format {1,2,3}
            checkedOutIDs = rawData.replace(/{|}/g, '').split(',').map(Number);
        } else {
            checkedOutIDs = [Number(rawData)];
        }

		const result = await DB_pool.query('SELECT fld_i_title, fld_i_author, fld_i_media FROM tbl_items WHERE fld_i_id_pk = ANY($1)', [checkedOutIDs]);
		
		res.json(result.rows);
	} catch (err) {
		res.status(500).json({ error: "Database error" });
	}
});


router.get('/dashadmin', checkAuthenticated, (req, res) => {
    if (req.user.fld_u_role === 'Admin') {
        res.sendFile(path.join(__dirname, '../private/dashadmin.html'))
    }
    else {
        res.sendFile(path.join(__dirname, '../public/index.html'))
    }
})


router.get('/dashteach', checkAuthenticated, (req, res) => {
    if (req.user.fld_u_role === 'Teacher') {
        res.sendFile(path.join(__dirname, '../private/dashteach.html'))
    }
    else {
        res.sendFile(path.join(__dirname, '../public/index.html'))
    }
})


//catalog

router.get('/api/books', async (req, res) => {
    const LIMIT = 15;
    const cursor = Number(req.query.cursor) || 0;
    let limit = Number(req.query.limit);
    if (!Number.isInteger(limit) || limit <= 0) {
        limit = LIMIT;
    }
    limit = Math.min(limit, LIMIT);
    try {
        const result = await DB_pool.query("SELECT * FROM tbl_items WHERE fld_i_id_pk > $1 ORDER BY fld_i_id_pk ASC LIMIT $2", [cursor, limit]);
        const rows = result.rows;
        const nextcursor = rows.length ? rows[rows.length - 1].fld_i_id_pk : null;
        res.json({ rows, nextcursor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

//overdue books
router.get('/api/books/overdue', async (req, res) => {
    const LIMIT = 15;
    const cursor = Number(req.query.cursor) || 0;
    let limit = Number(req.query.limit);
    if (!Number.isInteger(limit) || limit <= 0) {
        limit = LIMIT;
    }
    limit = Math.min(limit, LIMIT);
    try {
        const result = await DB_pool.query("SELECT t.*,u.fld_u_name,i.fld_i_title FROM tbl_transactions t JOIN tbl_users u ON t.fld_t_userId_fk = u.fld_u_id_pk JOIN tbl_items i ON t.fld_t_itemId_fk = i.fld_i_id_pk WHERE t.fld_t_returnDate IS NULL AND t.fld_t_dueDate < CURRENT_DATE AND t.fld_t_id_pk > $1 ORDER BY t.fld_t_id_pk ASC LIMIT $2", [cursor, limit]);
        const rows = result.rows;
        const nextcursor = rows.length ? rows[rows.length - 1].fld_t_id_pk : null;
        res.json({ rows, nextcursor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

//user history
router.get('/api/user/:userId/history', async (req, res) => {
    try {
        const result = await DB_pool.query("SELECT i.fld_i_id_pk, i.fld_i_title FROM tbl_users u JOIN LATERAL unnest(COALESCE(u.fld_u_borrowHistory, ARRAY[]::INTEGER[])) WITH ORDINALITY AS h(item_id,ord) ON TRUE JOIN tbl_items i ON i.fld_i_id_pk = h.item_id WHERE u.fld_u_id_pk = $1 ORDER BY h.ord DESC", [req.params.userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/api/teacher/checkedout', async (req, res) => {
    const LIMIT = 15;
    const cursor = Number(req.query.cursor) || 0;
    let limit = Number(req.query.limit);
    if (!Number.isInteger(limit) || limit <= 0) {
        limit = LIMIT;
    }
    limit = Math.min(limit, LIMIT);
    try{ 
        const result = await DB_pool.query("SELECT t.*, u.fld_u_name,i.fld_i_title FROM tbl_transactions t JOIN tbl_users u ON t.fld_t_userId_fk = u.fld_u_id_pk JOIN tbl_items i ON t.fld_t_itemId_fk = i.fld_i_id_pk WHERE t.fld_t_id_pk > $1 AND t.fld_t_returnDate IS NULL ORDER BY t.fld_t_id_pk ASC LIMIT $2;", [cursor,limit]);
        const rows = result.rows;
        const nextcursor = rows.length ? rows[rows.length - 1].fld_t_id_pk : null;
        res.json({rows, nextcursor});
    } catch (err) {
        console.error(err);
        res.status(500).json({error:'Database error'})
    }

    });

    //Alert routing need to figure some stuff out but this is the implementation. 
/*
router.get('/api/alerts' , async(req,res) =>{
    const result = await DB_pool.query(
          `SELECT t.*, i.fld_i_title
         FROM tbl_transactions t
         JOIN tbl_items i 
           ON t.fld_t_itemId_fk = i.fld_i_id_pk
         WHERE t.fld_t_userId_fk = $1
           AND t.fld_t_dueDate < NOW()
           AND t.fld_t_returnDate IS NULL`,
        [req.user.fld_u_id_pk]
    );
    res.json(result.rows);
});
*/
module.exports = router;
