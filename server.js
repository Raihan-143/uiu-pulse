require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/mongodb');
const userRoutes = require('./routes/users');
const rsvpRoutes = require('./routes/rsvps');
const researchApplicationRoutes = require('./routes/researchApplications');
const competitionRegistrationRoutes = require('./routes/competitionRegistrations');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => { console.log('Incoming request:', req.method, req.originalUrl); next(); }); console.log('typeof userRoutes:', typeof userRoutes);


// Connect MongoDB
connectDB();


// User API Routes
app.use('/api/users', userRoutes);
app.use('/api/rsvps', rsvpRoutes);
app.use('/api/research-applications', researchApplicationRoutes);
app.use('/api/competition-registrations', competitionRegistrationRoutes);


// Test Route
app.get('/', (req, res) => {
    res.send('UIU Pulse Backend Running');
});


// Start Server
app.listen(process.env.PORT || 5000, () => {
    console.log('Server running');
});