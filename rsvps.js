const express = require('express');
const EventRSVP = require('../models/EventRSVP');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { eventKey, eventName, email, eventDate, eventLocation } = req.body;

        if (!eventKey || !eventName || !email) {
            return res.status(400).json({ message: 'Event and email are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingRSVP = await EventRSVP.findOne({ eventKey, email: normalizedEmail });

        if (existingRSVP) {
            return res.status(200).json({ message: 'Already registered for this event', rsvp: existingRSVP });
        }

        const rsvp = await EventRSVP.create({
            eventKey,
            eventName,
            email: normalizedEmail,
            eventDate,
            eventLocation
        });

        return res.status(201).json({ message: 'RSVP saved successfully', rsvp });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({ message: 'Already registered for this event' });
        }

        return res.status(500).json({ message: 'Could not save RSVP', error: error.message });
    }
});

router.get('/', async (_req, res) => {
    try {
        const rsvps = await EventRSVP.find().sort({ createdAt: -1 });
        return res.json(rsvps);
    } catch (error) {
        return res.status(500).json({ message: 'Could not load RSVPs', error: error.message });
    }
});

module.exports = router;