const log = console.log;
const fetch = require('node-fetch');
const adjutorKey = process.env['ADJUTOR_KEY'];

// Verify Identity via bank account 
module.exports.verifybankidentity = async function(code, accountnumber) {
	const url = 'https://adjutor.lendsqr.com/v2/verification/bankaccount';
	//log(url);
	
	try {
		log(code);
		log(accountnumber);
		const response = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({ account_number: accountnumber, bank_code: code }),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${adjutorKey}`
			}
		});

		const data = await response.json();
		log(data);
		return data;
	}
	catch (err) {
		log(err);
		return res.render('generror');

	}

}


// Karma Check
module.exports.karmacheck = async function(bvn) {
	const url = `https://adjutor.lendsqr.com/v2/verification/karma/${bvn}`;
	//log(url);
	
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${adjutorKey}`
			}
		});

		const data = await response.json();
		log(data);
		return data;
	}
	catch (err) {
		log(err);
		return res.render('generror');
	}

}

// Lendsqr Ecosystem Check
module.exports.ecosystemcheck = async function(bvn) {
	const url = `https://adjutor.lendsqr.com/v2/verification/ecosystem/${bvn}`;
	//log(url);
	
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${adjutorKey}`
			}
		});

		const data = await response.json();
		log(data);
		return data;
	}
	catch (err) {
		log(err);
		return res.render('generror');
		
	}

}


// Credit Bureau (CRC)
module.exports.creditbureaucheck = async function(bvn) {
	const url = `https://adjutor.lendsqr.com/v2/creditbureaus/crc/${bvn}`;
	//log(url);
	
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${adjutorKey}`
			}
		});

		const data = await response.json();
		log(data);
		return data;
	}
	catch (err) {
		log(err);
		return res.render('generror');
	}

}
