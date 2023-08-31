const log = console.log;

//Format Numbers
module.exports.formatQuid = (amount) => {
	let amountString = amount.toString();

	let splitAmount = amountString.split("");

	let commapos1;
	let commapos2;
	let joined;
	
	if (splitAmount.length >= 7) {
		commapos1 = splitAmount.length - 3;
		commapos2 = splitAmount.length - 6;
		splitAmount.splice(commapos1, 0, ',');
		splitAmount.splice(commapos2, 0, ',');
		joined = splitAmount.join("");
	}
	
	else if (splitAmount.length >= 4) {
		commapos1 = splitAmount.length-3;
		splitAmount.splice(commapos1, 0, ',');
		joined = splitAmount.join("");
	}

	return joined;
}

// Check if borrower owns linked account
module.exports.checkaccountowner = (account, borrower) => {
	const borrowerSplit = borrower.split(' ');
	var ownsaccount = false;
	var correctOut = 0;
	var match = 0;
    var namecheck = '';

	for (var i = 0; i < borrowerSplit.length; i++) {

		if (account.includes(borrowerSplit[i])) {
			match = i + 1;
		}
	}

	if (match < borrowerSplit.length) {
		ownsaccount = false;
        namecheck = 'no';
	}
	else {
		ownsaccount = true;
        namecheck = 'yes';

	}

	//return ownsaccount;
	return namecheck;
}


// Get start date end date for transactions retrieval 
module.exports.getTransactionRange = () => {
	const today = new Date();
	const todayTime = Date.now();
	const sixmonthsTime = 15811200000;
	const startTime = todayTime - sixmonthsTime;
	const startDate = new Date(startTime);
	const eventtoday = today.toJSON();
	const eventstart = startDate.toJSON();
	const todaySplit = eventtoday.split('T')[0];
	const startSplit = eventstart.split('T')[0];

	var splittoday = todaySplit.split('-');
	var splitstart = startSplit.split('-');
	var turnaroundtoday = []
	var turnaroundstart = []

	for (var i = splittoday.length -1; i > -1; i--) {
	    //splitfour[i]
	    turnaroundtoday.push(splittoday[i]);
	    turnaroundstart.push(splitstart[i]);

	    var joinedtoday = turnaroundtoday.join();
	    var joinedstart = turnaroundstart.join();
	    var datetoday = joinedtoday.replace(/,/g, '-');
	    var datestart = joinedstart.replace(/,/g, '-');
	}

	var dates = {
		'from': datestart,
		'to':  datetoday
	}

	return dates
}


// Sort transactions into credit/debit arrays of monthly amounts
module.exports.getMonthlyAmounts = (transactions) => {
	var transArray = {
		credit: [],
		debit: []
	}
	var credmonth1 = 0;
	var credmonth2 = 0;
	var credmonth3 = 0;
	var credmonth4 = 0;
	var credmonth5 = 0;
	var credmonth6 = 0;
	var debmonth1 = 0;
	var debmonth2 = 0;
	var debmonth3 = 0;
	var debmonth4 = 0;
	var debmonth5 = 0;
	var debmonth6 = 0;

	const today = new Date();
	const end = Date.now();
	const onemonth = 2629800000;
	const twomonth = 5259600000;
	const threemonth = 7889400000;
	const fourmonth = 10519200000;
	const fivemonth = 13149000000;
	const sixmonth = 15778800000;


	for (var i = 0; i < transactions.data.length; i++) {
		var timeDate  = new Date(transactions.data[i].date);
		var time  = timeDate.getTime();

		// Credit
		if (transactions.data[i].type === 'credit' && ((end - time) < onemonth)) {
				credmonth1 = credmonth1 + transactions.data[i].amount;
		} else if (transactions.data[i].type === 'credit' && ((end - time) < twomonth)) {
			credmonth2 = credmonth2 + transactions.data[i].amount;
		} else if (transactions.data[i].type === 'credit' && ((end - time) < threemonth)) {
			credmonth3 = credmonth3 + transactions.data[i].amount;
		} else if (transactions.data[i].type === 'credit' && ((end - time) < fourmonth)) {
			credmonth4 = credmonth4 + transactions.data[i].amount;
		} else if (transactions.data[i].type === 'credit' && ((end - time) < fivemonth)) {
			credmonth5 = credmonth5 + transactions.data[i].amount;
		} else if (transactions.data[i].type === 'credit' && ((end - time) < sixmonth)) {
			credmonth6 = credmonth6 + transactions.data[i].amount;
		}

		// Debit 
		else if (transactions.data[i].type === 'debit' && ((end - time) < onemonth)) {
			debmonth1 = debmonth1 + transactions.data[i].amount;
		} else if (transactions.data[i].type === 'debit' && ((end - time) < twomonth)) {
			debmonth2 = debmonth2 + transactions.data[i].amount;
		} else if (transactions.data[i].type === 'debit' && ((end - time) < threemonth)) {
			debmonth3 = debmonth3 + transactions.data[i].amount;
		} else if (transactions.data[i].type === 'debit' && ((end - time) < fourmonth)) {
			debmonth4 = debmonth4 + transactions.data[i].amount;
		} else if (transactions.data[i].type === 'debit' && ((end - time) < fivemonth)) {
			debmonth5 = debmonth6 + transactions.data[i].amount;
		} else if (transactions.data[i].type === 'debit' && ((end - time) < sixmonth)) {
			debmonth6 = debmonth6 + transactions.data[i].amount;
		}

		//log(transactions.data[i].amount);
	}
	// Credits
	transArray.credit.push({'month': 1,	'amount': credmonth1});
	transArray.credit.push({'month': 2,	'amount': credmonth2});
	transArray.credit.push({'month': 3,	'amount': credmonth3});
	transArray.credit.push({'month': 4,	'amount': credmonth4});
	transArray.credit.push({'month': 5,	'amount': credmonth5});
	transArray.credit.push({'month': 6,	'amount': credmonth6});

	// Debit
	transArray.debit.push({'month': 1,	'amount': debmonth1});
	transArray.debit.push({'month': 2,	'amount': debmonth2});
	transArray.debit.push({'month': 3,	'amount': debmonth3});
	transArray.debit.push({'month': 4,	'amount': debmonth4});
	transArray.debit.push({'month': 5,	'amount': debmonth5});
	transArray.debit.push({'month': 6,	'amount': debmonth6});

	return transArray;

}