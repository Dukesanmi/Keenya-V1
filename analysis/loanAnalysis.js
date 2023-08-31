const log = console.log;
const daysInWeek = 7;
const daysInMonth = 30.4166667;
const daysInYear = 365;
const weeksInMonth = 4.3452381;
const weeksInYear = 52.1428571;
const monthsInYear = 12;

module.exports.repayment = (total, freq, duration) => {
	var repaymentAmount;
	var durationSplit = duration.split(' ');
	let durationNum = Number(durationSplit[0]);
	
	if (duration === '1 Day(s)') {
		repaymentAmount = total;
	} 
	// DAILY REPAYMENT
	// Loan to be fully repaid in days
	if (freq === 'Daily' && durationNum > 1 && durationSplit[1] === 'Day(s)') {
		// remove the > 1 in prod
		repaymentAmount = total / durationNum;
	}
	// Loan to be fully repaid in weeks
	if (freq === 'Daily' && durationSplit[1] === 'Week(s)') {
		repaymentAmount = total / (durationNum * daysInWeek);
	}
	// Loan to be fully repaid in months
	if (freq === 'Daily' && durationSplit[1] === 'Month(s)') {
		repaymentAmount = total / (durationNum * daysInMonth);
	}
	// Loan to be fully repaid in years
	if (freq === 'Daily' && durationSplit[1] === 'Year(s)') {
		repaymentAmount = total / (durationNum * daysInYear);
	}

	// WEEKLY PAYMENT
	// Loan to be fully repaid in weeks
	if (freq === 'Weekly' && durationSplit[1] === 'Week(s)') {
		// remove the > 1 in prod
		repaymentAmount = total / durationNum;
	}
	// Loan to be fully repaid in months
	if (freq === 'Weekly' && durationSplit[1] === 'Month(s)') {
		repaymentAmount = total / (durationNum * weeksInMonth);
	}
	// Loan to be fully repaid in years
	if (freq === 'Weekly' && durationSplit[1] === 'Year(s)') {
		repaymentAmount = total / (durationNum * weeksInYear);
	}

	// MONTHLY PAYMENT
	// Loan to be fully repaid in months
	if (freq === 'Monthly' && durationSplit[1] === 'Month(s)') {
		// remove the > 1 in prod
		repaymentAmount = total / durationNum;
	}
	// Loan to be fully repaid in months
	if (freq === 'Monthly' && durationSplit[1] === 'Year(s)') {
		repaymentAmount = total / (durationNum * weeksInMonth);
	}

	// ANNUAL PAYMENT
	// Loan to be fully repaid in years
	if (freq === 'Yearly' && durationSplit[1] === 'Year(s)') {
		// remove the > 1 in prod
		repaymentAmount = total / durationNum;
	}

	let roundedRepaymentAmount = Math.round(repaymentAmount);

	return roundedRepaymentAmount
}

// Mono credit analysis
module.exports.credAnalysis = (total, inflow) => {
	let points = 0;
	let eligibility = {
		analyse: false,
		eligible: true,
		note: ''
	};
	log(inflow);
	
	if (inflow.length < 7) {
		eligibility.analyse = false
		eligibility.eligible = false
		eligibility.note = 'Immature Account'
	}
	else {
		for (var i = 0; i < inflow.length; i++) {

			// Point scoring
			if (total < (0.1 * (inflow[i].amount/100))) { points = points + 6 }
			else if (total < (0.3 * (inflow[i].amount/100))) { points = points + 5 }
			else if (total < (0.5 * (inflow[i].amount/100))) { points = points + 4 }
			else if (total < (0.7 * (inflow[i].amount/100))) { points = points + 3 }
			else if (total > (0.7 * (inflow[i].amount/100))) { points = points + 2 }
			else if (total > (0.9 * (inflow[i].amount/100))) { points = points + 1 }
			else { points = points + 0 }
		}
		
		// Inference
		switch (Math.round((points - 2)/8)) {
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
	}	
	return eligibility;
}



module.exports.netCashFlow = (inflow, outflow, freq) => {
	let netFlow = [];
	for (var i = 0; i < inflow.length; i++) {
		var net;
		var fq;
		if (freq === 'Daily') { fq = daysInMonth }
		else if (freq === 'Weekly') { fq = weeksInMonth }
		else { fq = 1 }
		
		if (inflow[i].period === outflow[i].period) {
			net = Math.round((inflow[i].amount - outflow[i].amount)/fq);
			netFlow.push(net);
		}
	}
	log(`Netflow ${netFlow}`);

	return netFlow;
}


module.exports.installmentalEligibilityAnalysis = (repaymentAmount, netFlow) => {
	let eligibility = {
		eligible: true,
		centile: 0
	}
	let part = [];
	let total = netFlow.length;
	for (var i = 0; i < netFlow.length; i++) {
		if (repaymentAmount < netFlow[i]) {
			part.push(netFlow[i]);
		}
	}
    eligibility.centile = Math.round((part.length/total) * 100);
    if (eligibility.centile > 50) {
    	eligibility.eligible = true;
    } else {
    	eligibility.eligible = false;
    }
    return eligibility;
}
