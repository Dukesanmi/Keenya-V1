const log = console.log;
const User = require('../models/User');
//const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createToken, decodeToken } = require('../services/jwtService');
// JWT and Cookie expiry
const maxAge = 3*24*60*60;

// handle errors
const handleErrors = (err) => {
	log(err.message, err.code);
	//let errors = { name: '', email: '', password: '', mobile: '' };
	
	let errors = { email: '', password: '' };
	
	// handle login errors
	if (err.message === 'incorrect email') {
		errors.email ="This email is not registered"
	}

	if (err.message === 'incorrect password') {
		errors.password ="Incorrect password"
	}

	// duplicate error code 
	if (err.code === 11000) {
		errors.email = "Email is already taken";
		return errors;
	}

	//Validation errors
	if (err.message.includes('User validation failed')) {
		Object.values(err.errors).forEach(({ properties }) => {
			//log(properties);
			errors[properties.path] = properties.message;
		});
	}

	return errors;
}


/*const createToken = (id) =>{
	return jwt.sign({ id, email }, process.env['TOKEN'], {
		expiresIn: maxAge
	});
}*/

/*const decodeToken = (token) => {
	return jwt.verify(token, process.env['TOKEN']);
}*/


module.exports.signup = async (req, res) => {
	const { 
		name, 
		email, 
		password, 
		mobile  
	} = req.body;

	try {
		const user = await User.create({
			name, 
			email, 
			password, 
			mobile
		});
        //log(user);
		const token = createToken(user._id);
		//log(token);
		res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
		// res.status(201).json(user);
		res.status(201).json({user: user._id});
		log('registered')
	}
	catch(err){
		const errors = handleErrors(err);
		res.status(400).json({ errors });
	}
}

module.exports.login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.login(email, password);
		const token = createToken(user._id);
		//log(token);
		res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
		res.status(200).json({ user: user._id });
		log('Logged in');
		//log(user);
	}
	catch (err){
		const errors = handleErrors(err);
		res.status(400).json({ errors });
	}
}

module.exports.passwordReset = async (req, res) => {
	const { email } = req.body;
	
	try {
		const reset = await User.recoverpassword(email);
		res.status(200).json({ user: reset._id });	
	}
	catch (err){
		const errors = handleErrors(err);
		res.status(400).json({ errors });
	} 
}

module.exports.passwordUpdate = async (req, res) => {	
	const { password } = req.body;
	const token = req.cookies.reset;
	//log(req.cookies);
	log('Entered new password page')
	//const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNzg3NzcxOWU0OWU4OTRiOTI0MWZiOSIsImlhdCI6MTYzNTU1NzQ1MiwiZXhwIjoxNjM1ODE2NjUyfQ.o1azw4FqFYNhHqKWf4eQ7UwZqWI8LEZ_yf6R4Au_Zzs';
	log(token);
	const decoded = decodeToken(token);
	log(decoded);
	try {
		//log(`Password: ${password}`);
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);
		//log(`Hash: ${hash}`);
		const user = await User.findByIdAndUpdate(decoded.id, {password: hash});
		res.status(200).json({ user });
		log('From passwordUpdate handler');
		log(user);
	}
	catch(err) {
		log(err);
		const errors = handleErrors(err);
		res.status(400).json({ errors });
	}
}

module.exports.logout = (req, res) => {
	res.cookie('jwt', '', { maxAge: 1 });
	log('Logged out');
	res.redirect('/');
}

/*module.exports.passwordUpdate = async (req, res) => {
	const { password } = req.body;
	log('Entered controller');
}
*/

//Admin work
module.exports.findUsers = (req, res)=> {
	User.find({}, (err, users)=> {  
		if (err) res.status(500).json({err}); 
		res.status(200).json({users});
	});
}

module.exports.deleteUser = (req, res)=> {
	User.findByIdAndDelete(req.params.id, (err, userDeleted)=> {
		if (err) return res.status(500).json({err: 'delete error'});
		else if (!userDeleted) return res.status(404).json({message: 'User not found'});
		return res.status(200).json({message: 'User deleted successfully'});
	});
}

