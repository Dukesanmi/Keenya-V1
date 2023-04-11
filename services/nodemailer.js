const log = console.log;
const nodemailer = require('nodemailer');
const { formatQuid } = require('../analysis/miscellaneous');
const convertToWords = require('number-to-words');
const host = process.env.WEB_HOST;
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
	let accountLinkPage = `${host}/credit_analysis/${loan.loan_code}`
	let mailOptions = {
        from: userId,
        to: loan.lender.email,
        subject: `Potential Loan from ${lenderFirstName}`,
        html: `<body style="font-family: 'Inter', sans-serif; background-color: rgba(1,74,115, 0.1); padding: 15px 0 0 0; height: auto; overflow-y: auto;">
	<div class="div1" style="background-color: #ffffff; border: solid 1px #c0c0c0; border-radius: 0 20px 0 30px; width: 90%; margin: auto;">
		<img src="https://res.cloudinary.com/dxjqr24gm/image/upload/v1680600887/Keenya/Group_19.png" style="width: 22.5%; display: block; margin: auto; padding: 15px 0 14px 0;">
		<table style="font-family: 'Inter', sans-serif; width: 75%; margin: auto; color: #111111; padding: 17px 0 0 0;">
		  <tr>
		    <td style="font-size: 13px; padding: 5px 0 8px 0;">Dear ${borrowerFirstName},</td>
		  </tr>
		  <tr>
		    <td style="text-align: justify; font-size: 13px; line-height: 25px;">You are being considered for a loan of <b style="color: #193C4E">₦‎${loanAmount} (${loanAmountWords} NAIRA)</b> by ${lendername} and we are tasked to assess your ability to repay this loan extended to you.</td>
		  </tr>
		  <tr style="padding: 8px 0 0 0;">
		    <td style="text-align: justify; font-size: 13px; line-height: 25px;">Click on the button below to view the details of the loan and authenticate your account so analysis can be carried out.</td>
		  </tr>
		  <tr>
		    <td style="padding: 27px 0 0 0; margin: auto; width: 100%">
				<a href="${accountLinkPage}" target="_blank" style="display: table; margin: auto; text-align: center; text-decoration: none; background-color: #193C4E; color: #fff; padding: 15px 18px; border-radius: 3px 0 3px 0; font-size: 90%; width: 90%;"><span style="display: table-cell; text-align: center; vertical-align: middle;"><b>View the loan details and link your account</b></span></a>
		    </td>
		  </tr>
		  <tr>
		    <td>
		    	<p style="font-size: 11.5px; padding: 15px 0 0 0; line-height: 22px; opacity: 0.8; width: 110%;"><b>Note:</b> Sensitive information concerning your bank account will be kept confidential and will not be exposed to your credit provider or any other parties.</p>
				<p align="center" style="font-size: 11.5px; opacity: 0.8;">© Keenya 2023</p>

		    </td>
		  </tr>
		</table>
	</div>
</body>`
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
	let newLoanPage = `${host}/new_loan`
	let mailOptions = {
        from: userId,
        to: loanRequest.lenderEmail,
        subject: `Loan Request from ${borrowerFirstName}`,
        html: `<body style="font-family: 'Inter', sans-serif; background-image: url('https://res.cloudinary.com/dxjqr24gm/image/upload/v1680686695/Keenya/pexels-henry-_-co-1939485.jpg'); background-repeat: no-repeat;background-size: cover; padding: 15px 0 0 0; height: auto; overflow-y: auto;">
	<div class="div1" style="background-color: #ffffff; border: solid 1px #c0c0c0; border-radius: 0 20px 0 30px; width: 90%; margin: auto;">
		<img src="https://res.cloudinary.com/dxjqr24gm/image/upload/v1680600887/Keenya/Group_19.png" style="width: 22.5%; display: block; margin: auto; padding: 15px 0 14px 0;">
		<table style="font-family: 'Inter', sans-serif; width: 75%; margin: auto; color: #111111; padding: 17px 0 0 0;">
		  <tr>
		    <td style="font-size: 13px; padding: 5px 0 8px 0;">Hello there,</td>
		  </tr>
		  <tr>
		    <td style="text-align: justify; font-size: 13px; line-height: 25px;"><b style="color: #193C4E">${borrowerFirstName}</b> has requested you extended them a loan of <b style="color: #193C4E">₦${loanAmount}</b>.</td>
		  </tr>
		  <tr style="padding: 8px 0 0 0;">
		    <td style="text-align: justify; font-size: 13px; line-height: 25px;">If you are considering giving out this loan to ${borrowerFirstName}, we implore you to assess their ability to repay you on your terms, you can do that by clicking the button below.</td>
		  </tr>
		  <tr>
		    <td style="padding: 27px 0 0 0; margin: auto; width: 100%">
				<a href="${newLoanPage}" target="_blank" style="display: table; margin: auto; text-align: center; text-decoration: none; background-color: #193C4E; color: #fff; padding: 15px 18px; border-radius: 3px 0 3px 0; font-size: 90%; width: 90%;"><span style="display: table-cell; text-align: center; vertical-align: middle;"><b>Create new loan</b></span></a>
		    </td>
		  </tr>
		  <tr>
		    <td>
				<p align="center" style="font-size: 11.5px; opacity: 0.8;">© Keenya 2023</p>
		    </td>
		  </tr>
		</table>
	</div>
</body>`
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
        from: userId,
        to: 'sanmiakande93@gmail.com',
        subject: `Feedback Message from ${name}`,
        html: `<body style="font-family: sans-serif;">
	<img src="https://res.cloudinary.com/dxjqr24gm/image/upload/v1665660039/Keenya/Group_10.png" style="width: 30%; display: block; margin: ; padding: 15px 0 14px 0;">
	<div style="padding: 0 0 0 5px;">
		<p><b>Name:</b> ${name}</p>
		<p><b>Email:</b> ${email}</p>
		<p><b>Mobile Number:</b> ${mobile}</p>
		<p><b>Message:</b> ${message}</p>
	</div>
</body>
`
    }
    try {
    	const transport = await transporter.sendMail(mailOptions);
    }
    catch(err) {
    	throw err;
    }
}


// Credit Analysis Report
module.exports.analysisReport = function(loan, resultId) {
	log('in nodemailer!')
	let transporter = nodemailer.createTransport({
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
	log(loan.lender.email);
	let borrowerFirstName = loan.borrower.name.split(' ')[0];
	let lenderFirstName = loan.lender.name.split(' ')[0];
	let loanAmount = formatQuid(loan.loan_amount);
	let resultPage = `${host}/result/${resultId}`
	let mailOptions = {
        from: userId,
        to: loan.lender.email,
        subject: `Ability to Repay Report`,
        html: `
        <body style="font-family: 'Inter', sans-serif; font-weight: 600; background-color: rgba(1,74,115, 0.1); padding: 15px 0 0 0; height: auto; overflow-y: auto;">
        	<div style="background-color: #ffffff; border: solid 1px #c0c0c0; border-radius: 2px; width: 92%; margin: auto;">
        		<img src="https://res.cloudinary.com/dxjqr24gm/image/upload/v1680600887/Keenya/Group_19.png" style="width: 22.5%; display: block; margin: auto; padding: 15px 0 14px 0;">
				<table style="font-family: 'Inter', sans-serif; width: 75%; margin: auto; color: #111111; padding: 17px 0 0 0;">
					<tr>
		    			<td style="font-size: 13px; padding: 5px 0 8px 0;">Dear ${lenderFirstName},</td>
		  			</tr>
		  			<tr>
		  				<td style="text-align: justify; font-size: 13px; line-height: 25px;">We have assessed ${borrowerFirstName}'s ability to repay a potential loan of ₦${loanAmount} from you on your terms. Based on their financial information extracted with their consent, we have carried out our assessment and made our recommendation.</td>
		  			</tr>
		  			<tr style="padding: 8px 0 0 0;">
		    			<td style="text-align: justify; font-size: 13px; line-height: 25px;">Click on the button below to view the results of our assessment.</td>
		  			</tr>
		  			<tr>
		    			<td style="padding: 27px 0 0 0; margin: auto; width: 100%">
							<a href="${resultPage}" target="_blank" style="display: table; margin: auto; text-align: center; text-decoration: none; background-color: #193C4E; color: #fff; padding: 15px 18px; border-radius: 3px 0 3px 0; font-size: 90%; width: 90%;"><span style="display: table-cell; text-align: center; vertical-align: middle;"><b>View Assessment Result</b></span></a>
		    			</td>
		  			</tr>
		  			<tr>
		    			<td>
							<p align="center" style="font-size: 11.5px; opacity: 0.8;">© Keenya 2023</p>
		   				 </td>
		  			</tr>
				</table>
        	</div>
		</body>`
    }
    try {
    	log('sending?')
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
	let resetLink = `${host}/new_password/${user._id}`
	let mailOptions = {
        from: userId,
        to: user.email,
        subject: 'Password Recovery',
        html: `<body style="font-family: 'Inter', sans-serif; background-image: url(''); background-repeat: no-repeat;background-size: cover; padding: 15px 0 0 0; height: auto; overflow-y: auto;">
	<div class="div1" style="background-color: #ffffff; border: solid 1px #c0c0c0; border-radius: 2px; width: 92%; margin: auto;">
		<img src="https://res.cloudinary.com/dxjqr24gm/image/upload/v1680600887/Keenya/Group_19.png" style="width: 22.5%; display: block; margin: auto; padding: 15px 0 14px 0;">
		<table style="font-family: 'Inter', sans-serif; width: 75%; margin: auto; color: #111111; padding: 17px 0 0 0;">
		  <tr>
		    <td style="font-size: 13px; padding: 5px 0 8px 0;">Dear ${firstname},</td>
		  </tr>
		  <tr>
		    <td style="text-align: justify; font-size: 13px; line-height: 25px;">You requested a password reset. You can now reset and create your new password.</td>
		  </tr>
		  <tr style="padding: 8px 0 0 0;">
		    <td style="text-align: justify; font-size: 13px; line-height: 25px;">To create a new password, click on the link below.</td>
		  </tr>
		  <tr>
		    <td style="padding: 27px 0 0 0; margin: auto; width: 100%">
				<a href="${resetLink}" target="_blank" style="display: table; margin: auto; text-align: center; text-decoration: none; background-color: #193C4E; color: #fff; padding: 15px 18px; border-radius: 3px 0 3px 0; font-size: 90%; width: 90%;"><span style="display: table-cell; text-align: center; vertical-align: middle;"><b>Reset Link</b></span></a>
		    </td>
		  </tr>
		  <tr>
		    <td>
				<p align="center" style="font-size: 11.5px; opacity: 0.8;">© Keenya 2023</p>
		    </td>
		  </tr>
		</table>
	</div>
</body>
`
    }
    try {
    	const transport = await transporter.sendMail(mailOptions);
    }
    catch(err) {
    	throw err;
    }
}
