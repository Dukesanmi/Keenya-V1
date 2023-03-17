const log = console.log;
const nodemailer = require('nodemailer');
const { formatQuid } = require('../analysis/miscellaneous');
const convertToWords = require('number-to-words');
const userId = process.env.NODEMAILER_USER;
const pass = process.env.NODEMAILER_PASS;


// Loanee Account linking
module.exports.linkToBorrower = function(loan) {
	let transporter = nodemailer.createTransport({
		service: 'zoho',
		host: 'smtp.zoho.com',
		port: '465',
		secure: true,
		auth: {
			user: userId,
			pass: pass
		}
	});
	let borrowerFirstName = loan.borrower.name.split(' ')[0];
	let lenderFirstName = loan.lender.name.split(' ')[0];
	let lendername = loan.lender.name;
	let loanAmount = formatQuid(loan.loan_amount);
	let loanAmountWords = convertToWords.toWords(loan.loan_amount).toUpperCase();
	let accountLinkPage = `http://localhost:5000/credit_analysis/${loan.loan_code}`
	let mailOptions = {
        from: 'sanmiapptest@zohomail.com',
        to: loan.lender.email,
        subject: `Potential Loan from ${lenderFirstName}`,
        html: `<p>Dear ${borrowerFirstName},</p><p>You are being considered for a loan of <b>₦‎${loanAmount} (${loanAmountWords} NAIRA)</b> by ${lendername} and we are tasked to assess your ability to repay this loan extended to you.</p><p>Click on the link below to view the details of the loan and authenticate your account so analysis can be carried out.</p><p style="font-weight: 600;">Loan link: <a href="${accountLinkPage}" target="_blank">View the loan details and link Your account</a></p><br><p>Note: Sensitive information concerning your bank account will be kept confidential and will not be exposed to your credit provider or any other parties.</p>`
    }
    try {
    	transporter.sendMail(mailOptions);
    }
    catch(err) {
    	throw err;
    }
}


// Request a Loan
module.exports.loanRequestMail = async function(loanRequest) {

	let transporter = await nodemailer.createTransport({
		service: 'zoho',
		host: 'smtp.zoho.com',
		port: '465',
		secure: true,
		auth: {
			user: userId,
			pass: pass
		},
		debug: true,
		logger: true
	});
	let borrowerFirstName = loanRequest.borrower.split(' ')[0];
	let loanAmount = formatQuid(loanRequest.amount);
	let lenderEmail = loanRequest.lenderEmail;
	let newLoanPage = `http://localhost:5000/new_loan`
	let mailOptions = {
        from: 'sanmiapptest@zohomail.com',
        to: loanRequest.lenderEmail,
        subject: `Loan Request from ${borrowerFirstName}`,
        html: `<p>Hello there,</p><br><p>${borrowerFirstName} has requested you extended them a loan of ${loanAmount}.</p><br><p>If you are considering giving out this loan to ${borrowerFirstName} and you want to confirm their ability to repay you, click on <a href="${newLoanPage}" target="_blank">Create new Loan</a></p><br>`
    }

    try {
    	transporter.sendMail(mailOptions);
    }
    catch(err) {
    	throw err;
    }
}


// Send Feedback
module.exports.productFeedback = async function(feed) {
	let transporter = await nodemailer.createTransport({
		service: 'zoho',
		host: 'smtp.zoho.com',
		port: '465',
		secure: true,
		auth: {
			user: userId,
			pass: pass
		},
		debug: true,
		logger: true
	});
	let name = feed.name;
	let email = feed.email;
	let mobile = feed.mobile;
	let message = feed.message;
	let mailOptions = {
        from: 'sanmiapptest@zohomail.com',
        to: 'sanmiakande93@gmail.com',
        subject: `Feedback Message from ${name}`,
        html: `<p>Name: ${name}</p><br><p>Email: ${email}</p><br><p>Mobile Number: ${mobile}</p><br><p>Message: ${message}</p><br>`
    }
    try {
    	const transport = await transporter.sendMail(mailOptions);
    }
    catch(err) {
    	throw err;
    }
}


// Credit Analysis Report
module.exports.analysisReport = function(loan, borrower) {
	let transporter = nodemailer.createTransport({
		service: 'zoho',
		host: 'smtp.zoho.com',
		port: '465',
		secure: true,
		auth: {
			user: userId,
			pass: pass
		}
	});
	let borrowerFirstName = borrower.name.split(' ')[0];
	let lenderFirstName = lender.name.split(' ')[0];
	let accountLinkPage = `http://localhost:5000/credit_analysis`
	let mailOptions = {
        from: 'sanmiapptest@zohomail.com',
        to: user.email,
        subject: `Ability to Repay Report`,
        html: `<p>Dear ${loaneeFirstName},</p><p>You are being considered for credit of ${loan.loanAmount} by ${loanername} and we are tasked to carry out an ability to repay analysis to ensure you will be able to repay this loan.</p><p>Click on the link below to view the details of the loan and authenticate your account so analysis can be carried out.</p><p style="font-weight: 600;">Loan link: <a href="${accountLinkPage}" target="_blank">Link Your Account</a></p><p>Note: Sensitive information concerning your bank account will be kept confidential and will not be exposed to your credit provider or any other third parties.</p>`
    }
    try {
    	transporter.sendMail(mailOptions);
    }
    catch(err) {
    	throw err;
    }
}

// Password Recovery
module.exports.passwordRecoveryMail = async function(user) {
	let transporter = nodemailer.createTransport({
		service: 'zoho',
		host: 'smtp.zoho.com',
		port: '465',
		secure: true,
		auth: {
			user: userId,
			pass: pass
		}
	});
	let firstname = user.name.split(' ')[0];
	let resetLink = `http://localhost:5000/new_password/${user._id}`
	let mailOptions = {
        from: 'sanmiapptest@zohomail.com',
        to: user.email,
        subject: 'Password Recovery',
        html: `<p>Dear ${firstname},</p><p>You requested a password reset.</p><p>Click on the link below to create your new password.</p><p sty1le="font-weight: 600;">Password reset link: <a href="${resetLink}" target="_blank">Reset Link</a></p><p>You can now reset and create your new password.</p>`
    }
    try {
    	const transport = await transporter.sendMail(mailOptions);
    }
    catch(err) {
    	throw err;
    }
}
