const log = console.log;
//const axios = require('axios');
const fetch = require('node-fetch');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Feedback = require('../models/Feedback');
const CreditAnalysis = require('../models/CreditAnalysis');
const { createToken, decodeToken } = require('../services/jwtService');
const { linkToBorrower, loanRequestMail } = require('../services/nodemailer');
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
		log(err);
		next(err);
	}
}


exports.newLoan = async (req, res, next) => {
	//Get loaner's data
	let lenderData = res.locals.user;
	log('Lender Data');
	log(lenderData);
	log(req.body.borrowerName);
	//log(req.body.loanAmount);

	// Create Loan code
  const loan_token = createToken(lenderData._id);
  const loan_token_slice = loan_token.slice(160); 
  //log(loan_token_slice.length);
  //log(loanerData._id);	

  var userLoans = lenderData.loans_id;

  //Create new loan
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
    		repayment_date: req.body.repaymentDate,
    		repayment_duration:`${req.body.repaymentDurationNum} ${req.body.repaymentDurationAlp}`,
    		repayment_frequency: req.body.repaymentFrequency
    	},
    	loan_code: `loan_${loan_token_slice}`,
    	lender_id: lenderData._id
    });

    //log(listing);
    const savedListing = await listing.save();
    log(savedListing);
    // Notify Borrower of loan arrangement
    if (savedListing) {
    	userLoans.push(savedListing._id);
      log(savedListing.lender_id);
      log(userLoans);
      const pop = await User.findByIdAndUpdate(savedListing.lender_id, {loans_id: userLoans});
      log(`POP: ${pop}`);
      linkToBorrower(savedListing);
      //const pop = User.findByIdAndUpdate(loanerData._id, {})
      return res.status(201).redirect("/");
    }
  } catch (err) {
    log(err);
    //next(err);
  }

};


//Loan Analysis
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
		//log(res.locals.monoId);
		//log(`As at ${time} curent loan data ${res.locals.data.currentloan}`);
		res.render('analysis');
	} catch (err) {
		log(err);
		next(err);
	}
}

module.exports.financialData = async(req, res)=> {
	const { code, borrower, loanId } = req.body;
	//log(code);
	log(`loan id ${loanId}`);
	//log(borrower);

	if (code) {

		try {
			const monoId = await monoauth(code);
			//log(monoId);
			const accountInfo = await accountdetails(monoId);
			//log(`accountInfo: ${accountInfo}`);
			const identity = await accountidentity(monoId);
			//log(`accountInfo: ${identity}`);

			//log(`account name from controller: ${accountInfo.account.name}`);
			//log(accountInfo.meta.auth_method);

			//const finbd = await Loan.findById(loanId);
			//log(finbd);

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

			//Check if borrower owns linked account
			const checkAccount = checkaccountowner(accountInfo.account.name, borrower);
			log(`dispatch: ${dispatch}`);
			log(`passed checkAccount`);
			log(checkAccount);
			res.locals.monoId = monoId;
			//res.locals.ownsaccount = checkAccount;
			
			log(`before dispatch`);
			//update loan schema

			log(dispatch);
			log(Loan);
			const updateloan = await Loan.findByIdAndUpdate(loanId, dispatch);

			const updatesave = await updateloan.save();
			//log(updatesave);
			
			if (updatesave) {
				log('model updated!');
				res.cookie('monoId', monoId, { httpOnly: true, maxAge: maxAge * 1000 });
				res.cookie('ownAccount?', checkAccount, { httpOnly: false, maxAge: maxAge * 1000 });
				res.status(200).json('ID retrieved');
			}
							
			  log(`he done pass the set`);
		} 
		catch(err) {
			return err;
		}

	} else {
		res.status(500).json({ error: "Error somewhere" })
	}
	//log(monoId.id);

}

module.exports.loanAnalysis = async(req, res)=> {
	const { loan } = req.body; 
	const monoId = req.cookies.monoId;
	//log(`Mono ID: ${monoId}`); 
	//log(loan); 
	const totalLoan = loan.loan_amount + ((loan.interest_on_loan/100) * loan.loan_amount);
	const repaymentType = loan.repayment_terms.repayment_type;
	const repaymentDuration = loan.repayment_terms.repayment_duration;
	const repaymentFreq = loan.repayment_terms.repayment_frequency;

	// Repayment Amount
	const repaymentAmount = repayment(totalLoan, repaymentFreq, repaymentDuration);

	log(`Total Loan: ${totalLoan}`);
	log(`Repayment Type: ${repaymentType}`);
	log(`Repayment Duration: ${repaymentDuration}`);
	log(`Repayment Frequency: ${repaymentFreq}`);
	log(`Repayment Amount Per period: ${repaymentAmount}`);

	//log(log);
	//log(res.locals.monoId);
	log(`The monoID is ${monoId}`);
	
	// Get borrower's financial data from mono
	const creditHistory = await credithistory(monoId);
	//const debitHistory = await debithistory(monoId);
	
	log(creditHistory);
	//log(debitHistory);

	// Analyse financial data 
	let analysis;
	analysis = credAnalysis(totalLoan, creditHistory.history);	
	log(analysis);

	//create credit analysis 

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
    log('CreditAnalysis saved');
    log(savedCreditAnalysis);

		//update loan schema with credit analysis
		const loanupdate = await Loan.findByIdAndUpdate(loan._id, {credit_analysis: savedCreditAnalysis._id});
		const loansave = await loanupdate.save();
  	log('loansave before if statement');

		if (loansave) {
			log('loansave if is true');
			log(loansave);

			// Unlink user account	
			//await unlinkaccount(monoId);
			const unlink = await unlinkaccount(monoId);
			log(unlink);

			//res.status(200).redirect(`result/${savedCreditAnalysis._id}`);


			if (unlink === "OK") {
				log('should redirect now');
				//return res.status(200).redirect(`/result/${savedCreditAnalysis._id}`);
				return res.status(200).json({status: "OK", id: savedCreditAnalysis._id});
				//return res.status(200).redirect(`/result/${savedCreditAnalysis._id}`);

			}
		}

	} catch(err) {
		return err
	}

}

//Analysis Report
module.exports.analysisResult = async (req, res, next)=> {
	log('Entered report page controlla');
	const reportId = req.params.analysis_code;
	
	try {
		//Get credit analysis report
		//const report = await CreditAnalysis.findOne({ _id: req.params.analysis_code });
		const report = await CreditAnalysis.findById(reportId);
		const loan = await Loan.findById(report.loan);

		res.locals.report = report;
		res.locals.loan = loan;

		log(res.locals.loan);
		//log(res.locals.report);
		//res.render('result.ejs');
		res.render('resultcopy.ejs');
	}
	catch (err) {
		log(err);
		next(err);
	}
}

//Request a Loan
module.exports.requestLoan = (req, res)=> {
	const loanRequest = {
		borrower: req.body.borrowerName,
		lenderEmail: req.body.lenderEmail,
		amount: req.body.amount
	}
	try {
		//log(loanRequest);
		//Send mail to the lender
		loanRequestMail(loanRequest);
    return res.status(201).redirect("/");
	} catch(err) {
		return err
	}
}


//Receive user feedback
module.exports.productFeedback = async(req, res)=> {
	try {
		const feedback = await new Feedback({
			name: req.body.name,
			email: req.body.email,
			mobile: req.body.mobile,
			message: req.body.message
		});
		const savedFeedback = await feedback.save();
   // log(savedFeedback);
    if (savedFeedback) {
      productFeedback(savedFeedback);
      return res.status(201).redirect("/");
		} 
	} catch(err) {
			return err
	}
}

/*const overPay = repaymentAmountPerPeriod * numberOfPaymentPeriods;

if (overPay > totalAmountToBeRecovered) {
	let excess = overPay - totalAmountToBeRecovered;
	log('over by');
	log(excess);
}
*/


//Admin functions
module.exports.findLoans = (req, res)=> {
	//log(Loan);
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