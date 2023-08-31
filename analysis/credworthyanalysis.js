const log = console.log;
const CreditAnalysis = require('../models/CreditAnalysis');
const { karmacheck, ecosystemcheck, creditbureaucheck } = require('../services/lendsqrservice');
const { getTransactionRange } = require('../analysis/miscellaneous');
const { transactions } = require('../services/monoservices');
//const { transactions } = require('../services/okraservices');


// Karma
/*if (true) {
	break
} else {
	// Ecosystem Check
	if (ecocheck === 'Fail') {
		break;
	} else {
		// Income Stability
		// Spending Pattern
		// Final Analysis
	}
}*/

// Ecosystem check scoring
function ecocheckcalc(response) {
	var verdict = false;
	var finalscore = 0;
    var A = 0;
    var B = 0;
    var C = 0;
    var D = 0;
    var E = 0;
    var F = 0;
    var G = 0;
	var settled = (response.settled_loans / response.loans) * 100;
	var settled_amount = (response.settled_loan_amount / response.loan_amount) * 100;
	var past_due = (response.past_due_loans / response.loans) * 100;
	var past_due_amount = (response.past_due_loan_amount / response.loan_amount) * 100;
	var delayed = (response.delayed_paid_loans / response.loans) * 100;
	var delayed_amount = (response.delayed_paid_loan_amount / response.loan_amount) * 100;
	var failed_requests = (response.failed_loan_requests / response.loan_requests) * 100;

	if (settled > 90) {
		A = 2
	} else if (settled > 70) {
		A = 1
	} else {
		A = 0
	}
	if (settled_amount > 80) {
		B = 2
	} else if (settled_amount > 60) {
		B = 1
	} else {
		B = 0
	}
	if (past_due < 35) {
		C = 1
	} else {
		C = 0
	}
	if (past_due_amount < 50) {
		D = 1
	} else {
		D = 0
	}
	if (delayed < 30) {
		E = 1
	} else {
		E = 0
	}
	if (delayed_amount < 35) {
		F = 1
	} else {
		F = 0
	}
	if (failed_requests < 50) {
		G = 0
	} else {
		G = 1
	}

	finalscore = A + B + C + D + E + F + G;

	if (finalscore > 6) {
		verdict = true
	} else {
		verdict = false
	}

	return verdict;

}

// CRC check scoring
function crccheckcalc(response) {
	var verdict = false;
	var finalscore = 0;
	var A = 0;
	var B = 0;
	var C = 0;

	if (Number(response.credit_nano_summary.summary.no_of_delinqcreditfacilities) > 3) {
		A = 0;	
	} else {
		A = 1;
	}
	if (Number(response.mfcredit_nano_summary.summary.no_of_delinqcreditfacilities) > 3) {
		B = 0;
	} else {
		B = 1;
	}
	if (Number(response.mgcredit_nano_summary.summary.no_of_delinqcreditfacilities) > 3) {
		C = 0;
	} else {
		C = 1;
	}

	finalscore = A + B + C;

	if (finalscore > 2) {
		verdict = false
	} else {
		verdict = true
	}

	return verdict;
}

// Financial history check
function analyseAmounts(amounts, total) {
	let points = 0;
	let eligibility = {
		analyse: false,
		eligible: false,
		note: ''
	}
	for (var i = 0; i < amounts.credit.length; i++) {
		// Point scoring
		if (total < (0.1 * (amounts.credit[i].amount/100))) { points = points + 5 }
		else if (total < (0.3 * (amounts.credit[i].amount/100))) { points = points + 4 }
		else if (total < (0.5 * (amounts.credit[i].amount/100))) { points = points + 3 }
		else if (total < (0.7 * (amounts.credit[i].amount/100))) { points = points + 2 }
		else if (total > (0.9 * (amounts.credit[i].amount/100))) { points = points + 1 }
		else { points = points + 0 }

		if ((amounts.debit[i]/amounts.credit[i]) < 0.5) { points = points + 7}	
		else if ((amounts.debit[i]/amounts.credit[i]) < 0.8) { points = points + 5}	
		else if ((amounts.debit[i]/amounts.credit[i]) < 1) { points = points + 3}	
		else if ((amounts.debit[i]/amounts.credit[i]) < 1.5) { points = points + 2}	
		else if ((amounts.debit[i]/amounts.credit[i]) < 2) { points = points + 1}	
		else { points = points + 0}
		
		//log(points);

	}
	// Inference
		switch (Math.round((points - 2)/14)) {
	 		case 5:
				eligibility.analyse = true
	 			eligibility.eligible = true
	    		eligibility.note = "Very Strong";
	    		break;
	  		case 4:
	  			eligibility.analyse = true
	    		eligibility.eligible = true
	    		eligibility.note = "Strong";
	    		break;
	    	case 3:
	    		eligibility.analyse = true
	    		eligibility.eligible = null
	    		eligibility.note = "Fair";
	    		break;
	    	case 2:
	    		eligibility.analyse = true
	    		eligibility.eligible = false
	    		eligibility.note = "Weak";
	    		break;
	    	case 1:
	    		eligibility.analyse = true
	    		eligibility.eligible = false
	    		eligibility.note = "Very Weak";
	    		break;
	  		default:
	  			eligibility.analyse = true
	  			eligibility.eligible = false
	   			eligibility.note = "No ATR";
		}
	return eligibility;
}

// CRC & FINCHECK 
const fincheck = async(monoId, repayment) => {
	var finalresult = {
		analyse: false,
		eligible: false,
		note: ''
	}
	// Financial Analysis
	// Get transactions date range
	//const dateRange = getTransactionRange();
	try {
		const financials = await transactions(monoId);
		//log('finance check');
		if (financials) {
			//log(financials);
			const analysefinancials = analyseAmounts(financials, repayment);
			//log(analysefinancials);
			finalresult.analyse = analysefinancials.analyse
			finalresult.eligible = analysefinancials.eligible
			finalresult.note = analysefinancials.note
		}
	} catch(err) {
		return err;
	}
	//log(finalresult);
	return finalresult
}

const crcbureaucheck = async(currentloan) => {
	log('crc entered');
	var finalresult = {
		analyse: false,
		eligible: false,
		note: ''
	}
	const totalLoan = currentloan.loan_amount + ((currentloan.interest_on_loan/100) * currentloan.loan_amount);
	try {
		// Credit Bureau
		const crccheck = await creditbureaucheck(currentloan.borrower.finInfo.bvn);
		if (crccheck.message === "No CRC History") {
			// Financial Analysis
			const financialcheck = await fincheck(currentloan.borrower.finInfo.monoId, totalLoan);
			finalresult.analyse = financialcheck.analyse;
			finalresult.eligible = financialcheck.eligible;
			finalresult.note = financialcheck.note;
			//log('finance check');
			return financialcheck;
		} else if (crccheck.message === "Successful") {
			const crcbureau = crccheckcalc(crccheck.data);
			log('crc done');
			if (crcbureau === false) {
				finalresult.analyse = true
				finalresult.eligible = false
				finalresult.note = "Poor Credit History"
			} else {
				// Financial Analysis
				const financialcheck = await fincheck(currentloan.borrower.finInfo.monoId, totalLoan);
				finalresult.analyse = financialcheck.analyse;
				finalresult.eligible = financialcheck.eligible;
				finalresult.note = financialcheck.note;
				//log('finance check');
				return financialcheck;
			}	
		}
	} catch(err) {
		return err;
	}
	//return `crcbureaucheck ${finalresult}`;
}

// Final Analysis
/*module.exports.credanalysis = async(data, loan) => {
	log(loan);
	return loan;
}*/

module.exports.credanalysis = async(loan) => {
	log('in analysis funct');
	var result = {
		analyse: false,
		eligible: false,
		note: ''
	}
	//const totalLoan = currentloan.loan_amount + ((currentloan.interest_on_loan/100) * currentloan.loan_amount);
	try {
		log(loan);
		// Karma check
		const karma = await karmacheck(loan.borrower.finInfo.bvn);
		log('karma done');
		if (karma.message === "Successful") {
			result.analyse = true
			result.eligible = false
			result.note = "Bad karma"
		} else if (karma.message === "Identity not found in karma") {
			// Lendsqr Ecosystem check
			const lendsqrecosystemcheck = await ecosystemcheck(loan.borrower.finInfo.bvn);
			log('ecocheck done');
			if (lendsqrecosystemcheck.message !== "Successful") {
			   log('eco not found');
			   const creditcheck = await crcbureaucheck(loan);
			   log(creditcheck);
			   result.analyse = creditcheck.analyse;
			   result.eligible = creditcheck.eligible;
			   result.note = creditcheck.note;
			   log(`CredAnalysis ${result.note}`);
			} else {
				log('eco found');
				const ecocheck = ecocheckcalc(lendsqrecosystemcheck.data);
				if (ecocheck === false) {
					result.analyse = false
					result.eligible = false
					result.note = "Poor Credit History"
			    	log('after obj update');
				} else {
					log('good eco History -> crc check');
					const creditcheck = await crcbureaucheck(loan);
					log(creditcheck);
				    result.analyse = creditcheck.analyse;
				    result.eligible = creditcheck.eligible;
				    result.note = creditcheck.note;
				    log(`note ${creditcheck.note}`);	
				}
			}

		}
		return result;

	} catch(err) {
		log(err);
		throw err;
	}

}