const mongoose = require('mongoose');

const CompetitionRegistrationSchema = new mongoose.Schema({
    competitionKey: {
        type: String,
        required: true
    },

    competitionName: {
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
    registrationDeadline: String,
    eventDate: String,
    teamSize: String,
    eligibility: String,
    prizePool: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

CompetitionRegistrationSchema.index({ competitionKey: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('CompetitionRegistration', CompetitionRegistrationSchema);