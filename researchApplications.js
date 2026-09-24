const express = require('express');
const ResearchApplication = require('../models/ResearchApplication');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const {
            programKey,
            programName,
            email,
            organization,
            department,
            amount,
            deadline,
            eligibility
        } = req.body;

        if (!programKey || !programName || !email) {
            return res.status(400).json({ message: 'Research program and email are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingApplication = await ResearchApplication.findOne({
            programKey,
            email: normalizedEmail
        });

        if (existingApplication) {
            return res.status(200).json({
                message: 'Already applied for this research program',
                application: existingApplication
            });
        }

        const application = await ResearchApplication.create({
            programKey,
            programName,
            email: normalizedEmail,
            organization,
            department,
            amount,
            deadline,
            eligibility
        });

        return res.status(201).json({ message: 'Research application saved successfully', application });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(200).json({ message: 'Already applied for this research program' });
        }

        return res.status(500).json({ message: 'Could not save research application', error: error.message });
    }
});

router.get('/', async (_req, res) => {
    try {
        const applications = await ResearchApplication.find().sort({ createdAt: -1 });
        return res.json(applications);
    } catch (error) {
        return res.status(500).json({ message: 'Could not load research applications', error: error.message });
    }
});

module.exports = router;