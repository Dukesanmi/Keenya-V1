const log = console.log;
const fetch = require('node-fetch');


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
		//log(data);
		return data.id
	}
	catch (err) {
		log(`mono auth error ${err}`);
		return err;
	}

}

module.exports.accountdetails = async function(id) {
	let url = `https://api.withmono.com/accounts/${id}`	
	//log(id);

	try {
		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.json();
		//log(data)
		return data;
	}
	catch (err) {
		log(`account details error ${err}`);
		return err;
	}
}



module.exports.accountidentity = async function(id) {
	let url = `https://api.withmono.com/accounts/${id}/identity`	
	//log(`id i'm in ${id}`);

	try {
		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.json();
		//log(data)
		return data;
	}
	catch (err) {
		log(`identity error ${err}`);
		return err;
	}
}

module.exports.debithistory = async function(id) {
	let url = `https://api.withmono.com/accounts/${id}/debits`	
	//log(id);

	try {
		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.json();
		//log(`debit history ${data}`);
		//log(data.history);
		return data;
	}
	catch (err) {
		log(`debit history error ${err}`);
		return err;
	}
}


module.exports.credithistory = async function(id) {
	let url = `https://api.withmono.com/accounts/${id}/credits`	
	//log(id);
	try {
		const response = await fetch(url, { 
			method: 'GET', 
			headers: {
				'Content-Type': 'application/json',
				'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']
			}
		});

		const data = await response.json();
		//log(`credit history ${data}`);
		//log(data.history);
		return data;
	}
	catch (err) {
		log(`credit history error ${err}`);
		//log(err)
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
		//const data = await response.json();
		log(`unlink ${data}`);
		//log(data);
		return data;
	}
	catch (err) {
		log(`unlink error: ${err}`);
		//log(err);
		return err;
	}
}

/*module.exports.unlinkaccount = async function(id) {
	const url = `https://api.withmono.com/accounts/${id}/unlink` 
	const options = {method: 'POST', headers: {'accept': 'application/json', 'mono-sec-key': process.env['MONO_SECRET_KEY_TEST']}};
	var text;

	fetch(url, options)
	  .then((response) => response)
	  .then(function (result) {
	  	//log(result.statusText);
	  	text = result.statusText;
	  	log(text);
	  	return text;
	  })
	  //.then(result => console.log(result.statusText))
	  .catch(err => console.error(err));
}
*/