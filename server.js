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
console.log("Routes loaded");

app.use("/api", complaintRoutes);

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

io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { io };