import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from '../models/message.model.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Store online users: {userId: socketId}
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    // Broadcast online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // Typing indicator event
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  // Stop typing event
  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
    }
  });

  // Mark message as read
  socket.on("markAsRead", async ({ messageId, receiverId }) => {
    try {
      // Update message in database (assuming Message model has a 'read' field)
      const message = await Message.findByIdAndUpdate(
        messageId,
        { read: true },
        { new: true }
      );
      const senderSocketId = getReceiverSocketId(message.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageRead", { messageId, receiverId });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    // Broadcast updated online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };