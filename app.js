const log = console.log;
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const connectDB = require('./config/database');
const siteRoutes = require('./routes/siteRoutes');
const { checkUser } = require('./middleware/authentication');
const moment = require('moment');
const date = new Date();
const PORT = process.env['PORT'] || 8000

require('dotenv').config();

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))

// Middlewares
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cookieParser());

// Session and flash
app.use(session({
    secret: process.env['MYTOKEN'],
    cookie: {maxAge: 60000},
    saveUninitialized: false,
    resave: false
}));

app.use(flash());

app.use(function (req, res, next) {
    res.locals.message = req.flash('message');
    next();
})

// View engine
app.set('views', (__dirname + '/views'));
app.set('view engine', 'ejs');

// Database connection
connectDB();

// Routes
app.use(siteRoutes);
app.use('/auth', require('./routes/authRoutes'));

//App Listen
app.listen(PORT, log(`Server run on PORT ${PORT}, Date: ${date}`));