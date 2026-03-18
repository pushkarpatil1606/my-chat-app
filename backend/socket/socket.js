const { Server } = require("socket.io");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    }
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // --- SETUP & PRESENCE ---
    socket.on("setup", (userId) => {
      onlineUsers.set(String(userId), socket.id);
      socket.join(userId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("join_chat", (room) => {
      socket.join(room);
    });

    // --- MESSAGING & TYPING ---
    socket.on("typing", (room) => socket.to(room).emit("typing"));
    socket.on("stop_typing", (room) => socket.to(room).emit("stop_typing"));

    socket.on("new_message", async (data) => {
      try {
        const chatId = data.chat?._id || data.chat;
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        chat.users.forEach((userId) => {
          const sid = onlineUsers.get(String(userId));
          if (sid && sid !== socket.id) {
            io.to(sid).emit("message_received", data);
            Message.findByIdAndUpdate(data._id, { delivered: true }).exec();
          }
        });
      } catch (error) {
        console.error("Socket message error:", error);
      }
    });

    // --- WEBRTC SIGNALING ---

    // 1. Initiate Call
    socket.on("call_user", ({ to, offer, from, isAudioOnly }) => {
      const calleeSid = onlineUsers.get(String(to));
      if (calleeSid) {
        // We pass 'from' (ID) and 'isAudioOnly' so the UI knows how to react
        io.to(calleeSid).emit("incoming_call", { offer, from, isAudioOnly });
      }
    });

    // 2. Answer Call
    socket.on("answer_call", ({ to, answer }) => {
      const callerSid = onlineUsers.get(String(to));
      if (callerSid) {
        io.to(callerSid).emit("call_answered", { answer });
      }
    });

    // 3. Exchange ICE Candidates
    socket.on("ice_candidate", ({ to, candidate }) => {
      const targetSid = onlineUsers.get(String(to));
      if (targetSid) {
        io.to(targetSid).emit("ice_candidate", { candidate });
      }
    });

    // 4. End Call / Hang up
    socket.on("end_call", ({ to }) => {
      const targetSid = onlineUsers.get(String(to));
      if (targetSid) {
        io.to(targetSid).emit("call_ended");
      }
    });

    // --- DISCONNECTION ---
    socket.on("disconnect", () => {
      let disconnectedUser = null;
      for (let [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          disconnectedUser = userId;
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log("Socket disconnected:", socket.id);
    });
  });
};