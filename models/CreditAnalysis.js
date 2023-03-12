const mongoose = require('mongoose');
require('../models/User');
require('../models/Loan');

//Loan Schema
const creditAnalysisSchema = new mongoose.Schema({
    /*loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan'
    },*/
    loan: {
        type: String
    },
    credit_worthy: {
        type: Boolean,
        default: false
    },
    atr_level: {
        type: String
    },
    monoId: {
        type: String
    },
    analysis_conducted_at: {
        type: Date,
        default: Date.now
    }
});

const CreditAnalysis = mongoose.model("creditAnalysis", creditAnalysisSchema);

module.exports = CreditAnalysis;