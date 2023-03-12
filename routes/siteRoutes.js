const log = console.log;
const { Router } = require('express');
const { createToken } = require('../services/jwtService');
const siteController = require('../controllers/siteControllers');
const {	verifyToken, checkUser } = require('../middleware/authentication');
const router = Router();
const User = ('../models/User');
const CreditAnalysis = ('../models/CreditAnalysis');
const maxAge = 3*24*60*60;

//SITE PAGES
router.get('*', checkUser);

router.get('/', function(req, res) {
	res.render('index');
});

//LOAN PAGES
//Loan form
//router.get('/new_loan', checkUser, siteController.newLoanPage);
router.get('/new_loan', verifyToken, checkUser, siteController.newLoanPage);

router.post('/new_loan', checkUser, siteController.newLoan);

//Request a Loan
router.get('/request_loan', function(req, res) {
	res.render('requestloan');
});

router.post('/requestloan', siteController.requestLoan);

//Product Feedback
router.get('/feedback', function(req, res) {
	res.render('feedback');
});

router.post('/feedback', siteController.productFeedback);



//router.post('/notify_loanee', siteController.notifyLoanee);

//loan analysis
router.get('/credit_analysis/:loan_code', siteController.loanDetailsPage);

router.post('/financialdata', siteController.financialData);

router.post('/loananalysis', siteController.loanAnalysis);

router.get('/result/:analysis_code', siteController.analysisResult);


//loan analysis
//router.get('/');

//AUTH PAGES
//signup page
router.get('/signup', function(req, res) {
	res.render('signup');
});

//login page
router.get('/signin', function(req, res) {
	res.render('login');
});

//recover password page
router.get('/recover_password', function(req, res) {
	res.render('passwordrecovery');
});

//create and save a new password
router.get('/new_password/:id', async function(req, res) {
	const token = createToken(req.params.id);
	res.cookie('reset', token, { httpOnly: true, maxAge: maxAge * 1000 });
	res.render('newpassword');
});



//Admin functions
router.get('/check-credit-analysis/:loan_id', siteController.checkCreditAnalysis);
router.get('/loans', siteController.findLoans);
router.delete('/loans/:id', siteController.deleteLoan);

module.exports = router;