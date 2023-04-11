const log = console.log;
//const axios = require('axios');
const fetch = require('node-fetch');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Feedback = require('../models/Feedback');
const CreditAnalysis = require('../models/CreditAnalysis');
const { createToken, decodeToken } = require('../services/jwtService');
const { linkToBorrower, loanRequestMail, productFeedback, analysisReport } = require('../services/nodemailer');
const { repayment, credAnalysis } = require('../analysis/loanAnalysis');
const { formatQuid, checkaccountowner } = require('../analysis/miscellaneous');
const { monoauth, accountdetails, accountidentity, debithistory, credithistory, unlinkaccount } = require('../services/monoservices');
const maxAge = 2*60*60;


exports.newLoanPage = async(req, res, next)=> {
	try {
		res.locals.data = {
			user: res.locals.user,
			publicKey: process.env.PAYSTACK_PUBLIC_KEY_TEST,
			feeOrd: 300,
			feeX: 0.01 
		}
		res.render('newloan');
	} catch (err) {
		next(err);
	}
}


exports.newLoan = async (req, res, next) => {
	// Get loaner's data
	let lenderData = res.locals.user;

	// Create Loan code
  const loan_token = createToken(lenderData._id);
  const loan_token_slice = loan_token.slice(160); 

  var userLoans = lenderData.loans_id;
  var repayDate = '';
  var repayDuration = '';
  var repayFrequency = '';

  // Repayment methods 
  if (req.body.repaymentMethod === "One time repayment") {
  	repayDate = req.body.repaymentDate;
  	repayDuration = '';
  	repayFrequency = '';
  }
  else if (req.body.repaymentMethod === "Installmental repayment") {
  	repayDate = '';
  	repayDuration = `${req.body.repaymentDurationNum} ${req.body.repaymentDurationAlp}`;
  	repayFrequency = req.body.repaymentFrequency;
  }

  // Create new loan
  try {
    const listing = await new Loan({
    	lender: {
    		name: lenderData.name,
    		email: lenderData.email,
    		mobile: lenderData.mobile
    	},
    	borrower: {
    		name: req.body.borrowerName,
    		email: req.body.borrowerEmail,
    		mobile: req.body.borrowerMobile
    	},
    	loan_amount: req.body.loanAmount,
    	interest_on_loan: req.body.loanInterest,
    	repayment_terms: {
    		repayment_type: req.body.repaymentMethod,
    		repayment_date: repayDate,
    		repayment_duration: repayDuration,
    		repayment_frequency: repayFrequency
    	},
    	loan_code: `loan_${loan_token_slice}`,
    	lender_id: lenderData._id
    });

    const savedListing = await listing.save();
    
    // Notify Borrower of loan arrangement
    if (savedListing) {
    	userLoans.push(savedListing._id);
      const pop = await User.findByIdAndUpdate(savedListing.lender_id, {loans_id: userLoans});
      linkToBorrower(savedListing);
      return res.status(201).redirect("/");
    }
  } catch (err) {
    return err;
    //next(err);
  }

};


module.exports.loanDetailsPage = async(req, res, next)=> {
	try {
		const currentloan = await Loan.findOne({ loan_code: req.params.loan_code });
		const formattedAmount = formatQuid(currentloan.loan_amount);
		res.locals.data = {
			formattedAmount,
			currentloan,
			publicKey: process.env.MONO_PUBLIC_KEY_TEST
		}
		const currentDate = new Date();
		const time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
		res.render('analysis');
	} catch (err) {
		next(err);
	}
}


module.exports.financialData = async(req, res)=> {
	const { code, borrower, loanId } = req.body;

	if (code) {

		try {
			const monoId = await monoauth(code);
			const accountInfo = await accountdetails(monoId);
			const identity = await accountidentity(monoId);

			const dispatch = {
				$set: {
					'borrower.finInfo.monoId': monoId,
					'borrower.finInfo.auth_method': accountInfo.meta.auth_method,
					'borrower.finInfo.institution_name': accountInfo.account.institution.name,
					'borrower.finInfo.bank_code': accountInfo.account.institution.bankCode,
					'borrower.finInfo.institution_type': accountInfo.account.institution.type,
					'borrower.finInfo.account_name': accountInfo.account.name,
					'borrower.finInfo.account_number': accountInfo.account.accountNumber,
					'borrower.finInfo.account_type': accountInfo.account.type,
					'borrower.finInfo.currency': accountInfo.account.currency,
					'borrower.finInfo.account_balance': accountInfo.account.balance,
					'borrower.finInfo.bvn': identity.bvn
				}
			}

			// Check if borrower owns linked account
			const checkAccount = checkaccountowner(accountInfo.account.name, borrower);
			res.locals.monoId = monoId;
			//res.locals.ownsaccount = checkAccount;
			
			// Update loan schema
			const updateloan = await Loan.findByIdAndUpdate(loanId, dispatch);
			const updatesave = await updateloan.save();
			
			if (updatesave) {
				res.cookie('monoId', monoId, { httpOnly: true, maxAge: maxAge * 1000 });
				res.cookie('ownAccount?', checkAccount, { httpOnly: false, maxAge: maxAge * 1000 });
				res.status(200).json('ID retrieved');
			}		
		} 
		catch(err) {
			return err;
		}

	} else {
		res.status(500).json({ error: "Error somewhere" })
	}

}


module.exports.loanAnalysis = async(req, res)=> {
	const { loan } = req.body; 
	const monoId = req.cookies.monoId;
	const totalLoan = loan.loan_amount + ((loan.interest_on_loan/100) * loan.loan_amount);
	const repaymentType = loan.repayment_terms.repayment_type;
	const repaymentDuration = loan.repayment_terms.repayment_duration;
	const repaymentFreq = loan.repayment_terms.repayment_frequency;

	// Repayment Amount
	const repaymentAmount = repayment(totalLoan, repaymentFreq, repaymentDuration);

	// Get borrower's financial data from mono
	const creditHistory = await credithistory(monoId);
	//const debitHistory = await debithistory(monoId);

	// Analyse financial data 
	let analysis;
	log(creditHistory);
	analysis = credAnalysis(totalLoan, creditHistory.history);	

	// Create instance of credit analysis 
	var credWorthy = false;

	// Post credit analysis data to db
  try {
    const credAnal = await new CreditAnalysis({
    	loan: loan._id,
    	credit_worthy: analysis.eligible,
    	atr_level: analysis.note,
    	monoId: monoId
    });

    const savedCreditAnalysis = await credAnal.save();

		// Update loan schema with credit analysis
		const loanupdate = await Loan.findByIdAndUpdate(loan._id, {credit_analysis: savedCreditAnalysis._id});
		const loansave = await loanupdate.save();

		if (loansave) {
			// Unlink user account	
			//await unlinkaccount(monoId);
			const unlink = await unlinkaccount(monoId);

			if (unlink === "OK") {
				analysisReport(loan, savedCreditAnalysis._id);
				return res.status(200).json({ status: "OK" });
				//return res.redirect('/');
			}
		}

	} catch(err) {
		return err
	}

}


// Analysis Report
module.exports.analysisResult = async (req, res, next)=> {
	const reportId = req.params.analysis_code;
	
	try {
		// Get credit analysis report
		const report = await CreditAnalysis.findById(reportId);
		const loan = await Loan.findById(report.loan);

		res.locals.report = report;
		res.locals.loan = loan;

		//res.render('result.ejs');
		res.render('resultcopy.ejs');
	}
	catch (err) {
		next(err);
	}
}


// Request a Loan
module.exports.requestLoan = (req, res)=> {
	const loanRequest = {
		borrower: req.body.borrowerName,
		lenderEmail: req.body.lenderEmail,
		amount: req.body.amount
	}
	try {
		// Send mail to the lender
		loanRequestMail(loanRequest);
    return res.status(201).redirect("/");
	} 
	catch(err) {
		return err;
	}
}


// Receive user feedback
module.exports.productFeedback = async(req, res)=> {
	try {
		const feedback = await new Feedback({
			name: req.body.name,
			email: req.body.email,
			mobile: req.body.mobile,
			message: req.body.message
		});

		const savedFeedback = await feedback.save();
  
    if (savedFeedback) {
      productFeedback(savedFeedback);
      return res.status(201).redirect("/");
		} 
	} catch(err) {
			return err
	}
}


// Admin functions
module.exports.findLoans = (req, res)=> {
	Loan.find({}, (err, loan)=> {  
		if (err) res.status(500).json({err});
		res.status(200).json({loan});
	});
}

module.exports.deleteLoan = (req, res)=> {
	Loan.findByIdAndDelete(req.params.id, (err, loanDeleted)=> {
		if (err) return res.status(500).json({err: 'delete error'});
		else if (!loanDeleted) return res.status(404).json({message: 'Loan not found'});
		return res.status(200).json({message: 'Loan deleted successfully'});
	});
}

module.exports.checkCreditAnalysis = (req, res)=> {
	CreditAnalysis.findOne({loan: req.params.loan_id}, (err, analysis)=> {  
		if (err) res.status(500).json({err});
		else if (!analysis) return res.status(404).json({message: 'Analysis not found'});
		res.status(200).json({analysis});
	});
}