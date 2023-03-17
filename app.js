const log = console.log;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const connectDB = require('./config/database');
const siteRoutes = require('./routes/siteRoutes');
const { checkUser } = require('./middleware/authentication');
const moment = require('moment');
const date = new Date();
const PORT = process.env.PORT || 8000

require('dotenv').config();

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cookieParser());

// Global vars
app.use((req, res, next)=> {
    res.locals.monoId = "";
    next();
})
// View engine
app.set('view engine', 'ejs');

// Database connection
connectDB();

// Routes
app.use(siteRoutes);
app.use('/auth', require('./routes/authRoutes'));

//App Listen
app.listen(5000, log(`Server run on PORT ${PORT}, Date: ${date}`));