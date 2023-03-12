const mongoose = require('mongoose');
require('../models/User');
require('../models/CreditAnalysis');

//Lender Schema
const lenderSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    mobile: {
        type: String, 
        required: true
    }
});

//Borrower's Financial Information
const finInfoSchema = new mongoose.Schema({
    monoId: {
        type: String,
        default: ''
    },
    auth_method: {
        type: String, 
        default: ''
    },
    institution_name: {
        type: String,
        default: ''
    },
    bank_code: {
        type: String,
        default: ''
    },
    institution_type: {
        type: String,
        default: ''
    },
    account_name: {
        type: String, 
        required: ''
    },
    account_number: {
        type: String,
        default: ''
    },
    account_type: {
        type: String,
        default: ''
    },
    currency: {
        type: String,
        default: ''
    },
    account_balance: {
        type: Number
    },
    bvn: {
        type: String,
        default: ''
    }
    
});


//Repayment Terms Schema
const repaymentTermsSchema = new mongoose.Schema({
    repayment_type: {
        type: String,
        required: true
    },
    repayment_date: {
        type: Date,
        default: '' 
    },
    repayment_duration: {
        type: String,
        default: ''
    },
    repayment_frequency: {
        type: String,
        default: ''
    }
    /*keenya_repayment*/
});


//Borrower Schema
const borrowerSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    mobile: {
        type: String, 
        required: true
    }
    ,
    finInfo: {
        type: finInfoSchema
    }
});



//Loan Schema
const loanSchema = new mongoose.Schema({
    lender: {
        type: lenderSchema,
        required: true
    },
    borrower: {
        type: borrowerSchema,
        required: true
    },
    loan_amount: {
        type: Number,
        required: true
    },
    interest_on_loan: {
        type: Number,
        required: false
    },
    repayment_terms: {
        type: repaymentTermsSchema,
        required: true
    },
    keenya_repayment: {
        type: Boolean,
        default: false
    },
    loan_code: {
        type: String,
        required: true
    },
    credit_analysis: {
        type: mongoose.Schema.Types.ObjectId, 
        ref :"CreditAnalysis"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {timestamp: true});

const Loan = mongoose.model("loan", loanSchema);

module.exports = Loan;