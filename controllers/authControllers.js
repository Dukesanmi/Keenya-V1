const log = console.log;
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { createToken, decodeToken } = require('../services/jwtService');
// JWT and Cookie expiry
const maxAge = 3*24*60*60;


// Handle errors
const handleErrors = (err) => {
	//let errors = { name: '', email: '', password: '', mobile: '' };
	
	let errors = { email: '', password: '' };
	
	// Handle login errors
	if (err.message === 'incorrect email') {
		errors.email ="This email is not registered"
	}

	if (err.message === 'incorrect password') {
		errors.password ="Incorrect password"
	}

	// Duplicate error code 
	if (err.code === 11000) {
		errors.email = "Email is already taken";
		return errors;
	}

	// Validation errors
	if (err.message.includes('User validation failed')) {
		Object.values(err.errors).forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
	}

	return errors;
}


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

		const token = createToken(user._id);
		res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
		res.status(201).json({user: user._id});
	}
	catch(err) {
		const errors = handleErrors(err);
		res.status(400).json({ errors });
	}
}

module.exports.login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.login(email, password);
		const token = createToken(user._id);
		res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
		res.status(200).json({ user: user._id });
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
        req.flash("message", `Password reset has been sent to your email`);
		res.status(200).json({ user: reset._id });
		//return res.status(201).redirect('/');	
	}
	catch (err){
		const errors = handleErrors(err);
		res.status(400).json({ errors });
	}
}

module.exports.passwordUpdate = async (req, res) => {	
	const { password } = req.body;
	const token = req.cookies.reset;
	const decoded = decodeToken(token);

	try {
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);
		const user = await User.findByIdAndUpdate(decoded.id, {password: hash});
        req.flash("message", `Password successfully updated`);
		res.status(200).json({ user });
		//return res.status(201).redirect('/signin');	
	}
	catch(err) {
		const errors = handleErrors(err);
		res.status(400).json({ errors });
	}
}

module.exports.logout = (req, res) => {
	res.cookie('jwt', '', { maxAge: 1 });	
    req.flash("message", `Logged out successfully`);
	return res.redirect('/');
}


// Admin functions
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
