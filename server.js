const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

app.set('io', io);

const complaintRoutes = require("./routes/complaintRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
console.log("Routes loaded");

app.use("/api", complaintRoutes);
app.use("/api/complaints", verificationRoutes);

// MongoDB Connection - Use environment variable or local fallback
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tnwbams";

mongoose.connect(mongoURI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log("DB Error:", err);
});

// Test Route
app.get("/", (req, res) => {
    res.send("TN-WBAMS Backend Running");
});

const PORT = process.env.PORT || 5000;

/**
 * Socket.IO Event Handlers
 * Manages real-time communication with connected clients
 */
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Send connection confirmation
    socket.emit('connected', {
        message: 'Connected to TN-WBAMS server',
        timestamp: new Date().toISOString()
    });
    
    /**
     * Real-time event listeners
     */
    
    // Listen for manual verification events
    socket.on('verificationUpdated', (data) => {
        console.log('[Socket] Verification updated:', data);
        io.emit('verificationUpdatedBroadcast', data);
    });
    
    // Listen for complaint updates
    socket.on('complaintStatusChanged', (data) => {
        console.log('[Socket] Complaint status changed:', data);
        io.emit('complaintStatusChangedBroadcast', data);
    });
    
    // Listen for dashboard filter requests
    socket.on('dashboardFilterRequest', (data) => {
        console.log('[Socket] Dashboard filter request:', data);
        // Admin dashboard uses this to update filtered view
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { io };