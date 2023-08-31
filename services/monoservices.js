const log = console.log;
const fetch = require('node-fetch');
const { getMonthlyAmounts, getTransactionRange } = require('../analysis/miscellaneous');



module.exports.monoauth = async function(code) {
	const url = 'https://api.withmono.com/account/auth';

	try {
		const response = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({ code }),
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.json();
		return data.id
	}
	catch (err) {
		return err;
	}

}


module.exports.accountdetails = async function(id) {
	let url = `https://api.withmono.com/accounts/${id}`

	try {
		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.json();
		return data;
	}
	catch (err) {
		return err;
	}
}


module.exports.accountidentity = async function(id) {
	let url = `https://api.withmono.com/accounts/${id}/identity`	

	try {
		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.json();
		return data;
	}
	catch (err) {
		return err;
	}
}


module.exports.debithistory = async function(id) {
	let url = `https://api.withmono.com/accounts/${id}/debits`;

	try {
		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.json();
		return data;
	}
	catch (err) {
		return err;
	}
}


module.exports.credithistory = async function(id) {
	let url = `https://api.withmono.com/accounts/${id}/credits`;	

	try {
		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.json();
		return data;
	}
	catch (err) {
		return err;
	}
}


module.exports.transactions = async function(id) {
	const daterange = getTransactionRange();
	const limit = 2147483600;
	let url = `https://api.withmono.com/accounts/${id}/transactions?start=${daterange.from}&end=${daterange.to}&limit=${limit}&paginate=false`
	//let url = `https://api.withmono.com/accounts/${id}/transactions`;

	try {
		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.json();
		const amounts = getMonthlyAmounts(data);
		log(amounts);
		return amounts;
	}
	catch (err) {
		return err;
	}
}


module.exports.unlinkaccount = async function(id) {
	let url = `https://api.withmono.com/accounts/${id}/unlink`

	try {
		const response = await fetch(url, { 
			method: 'POST', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.text();
		return data;
	}
	catch (err) {
		return err;
	}
}