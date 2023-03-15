const log = console.log;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {	isEmail, isMobilePhone	} = require('validator');
const { passwordRecoveryMail } = require('../services/nodemailer');
require('../models/Loan');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: [true, 'Please enter your email address'],
		unique: true,
		validate: [isEmail, 'Please enter a valid email address']
	},
	password: {
		type: String,
		required: [true, 'Please enter a password'],
		minlength: [6, 'Password length should be minimum of 6 characters']
	},
	mobile: {
		type: String,
		required: [true, 'Enter a valid mobile phone number'],
		validate: [isMobilePhone, 'Please enter a valid phone number']
	},
	loans_id: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Loans'
	}]
})

UserSchema.pre('save', async function(next) {
	const salt = await bcrypt.genSalt();
	this.password = await bcrypt.hash(this.password, salt);
	// console.log('user about to be created', this);
	next();
});

// Static method to login user
UserSchema.statics.login = async function(email, password) {
	const user = await this.findOne({ email });
	if (user) {
		log(user.password);
		log('From login statics');
		log(user);
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			return user;
		}
		throw Error('incorrect password');
	}
	throw Error('incorrect email');
}

// Static method to reset password
UserSchema.statics.recoverpassword = async function(email) {
	const user = await this.findOne({ email });
	if (user) {
		log(user);
		const mail = await passwordRecoveryMail(user);
		return user;
	}
	throw Error('incorrect email');
}

const User = mongoose.model('User', UserSchema);

module.exports = User;