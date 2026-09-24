const mongoose = require('mongoose');

const EventRSVPSchema = new mongoose.Schema({
    eventKey: {
        type: String,
        required: true
    },

    eventName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    eventDate: String,
    eventLocation: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

EventRSVPSchema.index({ eventKey: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('EventRSVP', EventRSVPSchema);