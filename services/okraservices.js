const log = console.log;
const fetch = require('node-fetch');
const okra_key = process.env['OKRA_SECRET_KEY'] ;
const okra_token = process.env['OKRA_CLIENT_TOKEN'];
const { getMonthlyAmounts, getTransactionRange } = require('../analysis/miscellaneous');


// Get User transactions by date
module.exports.transactions = async(customer_id) => {
	const url = 'https://api.okra.ng/v2/transactions/getByCustomerDate';
	log(url);
	
	try {
	    const dateRange = getTransactionRange();
	    log(dateRange.from);
	    log(dateRange.to);
		//log(accountnumber);
		const response = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({ from: dateRange.from, to: dateRange.to, limit: 2147483600, customer_id: customer_id }),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${okra_key}`
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

// Get User spending habits
/*
2023-01-31
2023-08-02*/