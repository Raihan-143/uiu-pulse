const mongoose = require('mongoose');

const ResearchApplicationSchema = new mongoose.Schema({
    programKey: {
        type: String,
        required: true
    },

    programName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    organization: String,
    department: String,
    amount: String,
    deadline: String,
    eligibility: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

ResearchApplicationSchema.index({ programKey: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('ResearchApplication', ResearchApplicationSchema);