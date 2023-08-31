const log = console.log;
//const axios = require('axios');
const fetch = require('node-fetch');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Feedback = require('../models/Feedback');
const CreditAnalysis = require('../models/CreditAnalysis');
const { createToken, decodeToken } = require('../services/jwtService');
const { linkToBorrower, loanRequestMail, productFeedback, analysisReport } = require('../services/nodemailer');
const { monoauth, accountdetails, accountidentity } = require('../services/monoservices');
const { credanalysis } = require('../analysis/credworthyanalysis');
const { formatQuid, checkaccountowner, getTransactionRange } = require('../analysis/miscellaneous');
const maxAge = 2*60*60;


exports.newLoanPage = async(req, res, next)=> {
	try {
		res.locals.data = {
			user: res.locals.user,
			publicKey: process.env['PAYSTACK_PUBLIC_KEY_TEST'],
			feeOrd: 500,
			feeX: 0.01 
		}
		res.render('newloan');
	} catch (err) {
    	res.render('generror')
		//next(err);
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
      req.flash("message", `Loan successfully created! ${savedListing.borrower.name} has been notified via email.`);
      return res.status(201).redirect("/");
    }
  } catch (err) {
      //req.flash("Error", `Error occurred`);
    	log(err);
    	res.render('generror');
    	//return err;
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
			paypublicKey: process.env['PAYSTACK_PUBLIC_KEY_TEST'],
			publicKey: process.env.MONO_PUBLIC_KEY_TEST,
			feeOrd: 500,
			feeX: 0.01
		}
		const currentDate = new Date();
		const time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
		if (currentloan.analysed === true) {
			return res.render('analysed');
		}
		if (currentloan.name_valid === 'no') {
			return res.render('analysis-retry');
		} else {
			return res.render('analysis');
		}
	} catch (err) {
			//log(err);
    	return res.render('generror');
		//next(err);
	}
}

module.exports.loanDetailsPageretry = async(req, res, next)=> {
	try {
		const currentloan = await Loan.findOne({ loan_code: req.params.loan_code });
		const formattedAmount = formatQuid(currentloan.loan_amount);
		res.locals.data = {
			formattedAmount,
			currentloan,
			paypublicKey: process.env['PAYSTACK_PUBLIC_KEY_TEST'],
			publicKey: process.env.MONO_PUBLIC_KEY_TEST,
			feeOrd: 500,
			feeX: 0.01
		}
		const currentDate = new Date();
		const time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
		if (currentloan.analysed === true) {
			return res.render('analysed');
		} else {
			return res.render('analysis-retry');
		}
	} catch (err) {
			//log(err);
    	return res.render('generror');
		//next(err);
	}
}

module.exports.financialData = async(req, res)=> {
	const { code, currentloan } = req.body;
		//log(data);
		//log(currentloan);

	if (code) {
		const monoId = await monoauth(code);
		const accountInfo = await accountdetails(monoId);
		const identity = await accountidentity(monoId);

		try {
			const namecheck = checkaccountowner(accountInfo.account.name, currentloan.borrower.name);
			log(namecheck);
			log('before dispatch');
			log(monoId);


			// Update finInfo in loan schema
			const dispatch = {
				$set: {
					//'analysed': true,
					'name_valid': namecheck,
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
					//'borrower.finInfo.bvn': identity.bvn,
					'borrower.finInfo.bvn': 20032345659
				}
			}
			log('dispatch');

			// Update loan schema
			const updateloan = await Loan.findByIdAndUpdate(currentloan._id, dispatch);
			const updatesave = await updateloan.save();
			//log(updatesave);

			/*const findnewloan = await Loan.findById(currentloan._id);
			log(findnewloan);
			//log(`updatesave ${updatesave}`);	*/

			if (updatesave) {
				res.cookie('monoId', monoId, { httpOnly: true, maxAge: maxAge * 1000 });
				res.cookie('loanId', currentloan._id, { httpOnly: false, maxAge: maxAge * 1000 });
				res.cookie('ownAccount?', namecheck, { httpOnly: false, maxAge: maxAge * 1000 });
				return res.status(200).json('ID retrieved');
			}

			//return res.status(201).json("Data retreived");
		}
		catch(err) {		
			res.status(500).json({ error: "Error somewhere" });
			//return err;
		}

	} else {
    	return res.render('generror');
		//res.status(500).json({ error: "Error somewhere" })

	}

}

// Loan Analysis 
module.exports.loanAnalysis = async(req, res, next)=> {
	//const { loanId } = req.body; 
	const loanId = req.cookies.loanId;
	const monoId = req.cookies.monoId;
	log(loanId);
	try {
		// Get loan object
		const loan = await Loan.findById(loanId);
		log(loan);

		// Analyse Data
		var analysis = {
			analysed: false,
			eligible: false,
			note: ''
		}
 
		const analyseLoan = await credanalysis(loan);
		log(analyseLoan);
		analysis.analyse = analyseLoan.analyse;
		analysis.eligible = analyseLoan.eligible;
		analysis.note = analyseLoan.note;
		
		// Create instance of credit analysis 
		const credAnal = await new CreditAnalysis({
		 	loan: loan._id,
		 	credit_worthy: analysis.eligible,
		 	atr_level: analysis.note,
		 	okra_customer_id: loan.borrower.finInfo.customerId
		});

		// Post credit analysis data to db
		const savedCreditAnalysis = await credAnal.save();

		const dispatchAnal = {
			$set: { 'analysed': analysis.analyse, 'credit_analysis': savedCreditAnalysis._id }
		}

		// Save analysis result to db collects
		// Update loan schema with credit analysis
		const loanupdate = await Loan.findByIdAndUpdate(loan._id, dispatchAnal);
		//const loanupdate = await Loan.findByIdAndUpdate(loan._id, {credit_analysis: savedCreditAnalysis._id});
		const loansave = await loanupdate.save();

	
		// Redirect to home page
		if (loansave) {
			analysisReport(loan, savedCreditAnalysis._id);
			req.flash("message", `Assessment report has been sent to your potential lender and you should also get a copy.`);
		  return res.status(201).redirect("/");
	  }

	} catch (err) {
		log(err);
		return res.render('generror');
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
    req.flash("message", `Your loan request has been sent to ${loanRequest.lenderEmail}`);
    return res.status(201).redirect("/");
	} 
	catch(err) {
    res.render('generror');
		//return err;
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
      req.flash("message", `Thank you! We appreciate your feedback`);
      return res.status(201).redirect("/");
		} 
	} catch(err) {
    	res.render('generror')
			//return err
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