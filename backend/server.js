require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const chatRoutes = require('./routes/chatRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const socketHandler = require('./socket/socket');
const userRoutes = require("./routes/userRoutes");


connectDB();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use("/api/users", userRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);

const server = http.createServer(app);
socketHandler(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0",() => console.log("Server running on", PORT));
