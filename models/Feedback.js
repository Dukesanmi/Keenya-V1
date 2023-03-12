const mongoose = require('mongoose');
const { isEmail} = require('validator');
//require('../models/User');
//require('../models/CreditAnalysis');


//Feedback Schema
const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: [isEmail, 'Please enter a valid email address']
    },
    mobile: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {timestamp: true});

const Feedback = mongoose.model("feedback", feedbackSchema);

module.exports = Feedback;