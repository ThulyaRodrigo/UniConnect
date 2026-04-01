const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Assuming default Vite port
        methods: ["GET", "POST"]
    }
});

// Make io accessible in controllers
app.set('io', io);

// Online user map: socketId -> userId
const onlineUsers = new Map();

// Socket.io handlers
io.on('connection', (socket) => {
    // console.log(`User Connected: ${socket.id}`);

    // Register user as online
    socket.on('addUser', (userId) => {
        onlineUsers.set(socket.id, userId.toString());
        // Broadcast updated online list to all clients
        io.emit('getOnlineUsers', Array.from(onlineUsers.values()));
    });

    // Join a specific conversation room
    socket.on('join_room', (data) => {
        socket.join(data);
        // console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    // Handle typing status
    socket.on('typing', (data) => {
        socket.to(data.room).emit('display_typing', data);
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(socket.id);
        io.emit('getOnlineUsers', Array.from(onlineUsers.values()));
        // console.log('User Disconnected', socket.id);
    });
});

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
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((err) => console.log('MongoDB Connection Failed: ', err));

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});