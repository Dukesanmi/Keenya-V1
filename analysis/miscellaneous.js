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

module.exports.checkaccountowner = (account, borrower) => {
	const borrowerSplit = borrower.split(' ');
	var ownsaccount = false;
	var correctOut = 0;
	var match = 0;

	log(borrowerSplit);
	log(`account name is ${account}`);

	for (var i = 0; i < borrowerSplit.length; i++) {
		log(borrowerSplit[i]);
		if (account.includes(borrowerSplit[i])) {
			match = i + 1;
			log(`matches ${match}`);
		}
	}
	log(`match ${match}`);
	if (match < borrowerSplit.length) {
		ownsaccount = false;
		log('Names does not match');
	}
	else {
		ownsaccount = true
		log('Name matches');
	}
	log(ownsaccount);

	return ownsaccount;
}