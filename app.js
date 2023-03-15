const log = console.log;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const connectDB = require('./config/database');
const siteRoutes = require('./routes/siteRoutes');
const { checkUser } = require('./middleware/authentication');
//const authRoutes = require('./routes/authRoutes');
//const { requireAuth, checkUser, verifyWebhook, requireMonoReauthToken } = require('./middleware/authMiddleware');
//const controllers = require('./controllers/allControllers');
const moment = require('moment');
const date = new Date();
const PORT = process.env.PORT || 8000

require('dotenv').config();

const app = express();

/*app.locals.getPage = function(page) {
  const page_number = page.split("page=")[1];
    return `?page=${page_number}`
}

app.locals.setCurrency = function(amount) {
  let res = parseFloat(amount)*0.01  // Convert to naira from kobo
  return res.toLocaleString()
}

app.locals.formatTime = function(time) {
  return moment(time).format("DD-MM-YYYY h:mm:ss");
}
*/

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))

// middleware
//app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cookieParser());

//Global Vars
app.use((req, res, next)=> {
    res.locals.monoId = "";
    //res.locals.user = {};
    next();
})
// view engine
app.set('view engine', 'ejs');

// database connection
connectDB();

// routes
// app.get('/force-refresh', requireAuth, (req, res) => res.render('smoothies'));
//app.get('*', checkUser);
app.use(siteRoutes);
app.use('/auth', require('./routes/authRoutes'));

//app.use(authRoutes);

//App Listen
//app.listen(PORT, log(`Server run on PORT ${PORT}`));
app.listen(5000, log(`Server run on PORT ${PORT}, Date: ${date}`));