const express = require('express');
const CompetitionRegistration = require('../models/CompetitionRegistration');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {
            competitionKey,
            competitionName,
            email,
            organization,
            registrationDeadline,
            eventDate,
            teamSize,
            eligibility,
            prizePool
        } = req.body;

        if (!competitionKey || !competitionName || !email) {
            return res.status(400).json({ message: 'Competition and email are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingRegistration = await CompetitionRegistration.findOne({
            competitionKey,
            email: normalizedEmail
        });

        if (existingRegistration) {
            return res.status(200).json({
                message: 'Already registered for this competition',
                registration: existingRegistration
            });
        }

        const registration = await CompetitionRegistration.create({
            competitionKey,
            competitionName,
            email: normalizedEmail,
            organization,
            registrationDeadline,
            eventDate,
            teamSize,
            eligibility,
            prizePool
        });

        return res.status(201).json({ message: 'Competition registration saved successfully', registration });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({ message: 'Already registered for this competition' });
        }

        return res.status(500).json({ message: 'Could not save competition registration', error: error.message });
    }
});

router.get('/', async (_req, res) => {
    try {
        const registrations = await CompetitionRegistration.find().sort({ createdAt: -1 });
        return res.json(registrations);
    } catch (error) {
        return res.status(500).json({ message: 'Could not load competition registrations', error: error.message });
    }
});

module.exports = router;