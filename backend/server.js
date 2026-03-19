const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Allows us to parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Basic Test Route
app.get('/', (req, res) => {
    res.send('Event Management API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/societies', require('./routes/societyRoutes'));
app.use('/api/handover', require('./routes/handoverRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/transports', require('./routes/transportRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/verify', require('./routes/verificationRoutes'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((err) => console.log('MongoDB Connection Failed: ', err));

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});