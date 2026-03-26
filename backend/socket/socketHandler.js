import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const userSockets = new Map(); 

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // User joins with their ID
    socket.on('join', (userId) => {
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      console.log(`👤 User ${userId} joined with socket ${socket.id}`);
      socket.broadcast.emit('userOnline', userId);
    });

    // User joins a conversation room
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`💬 User joined conversation: ${conversationId}`);
    });

    // User leaves a conversation room
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('newMessageSent', ({ conversationId, message, recipientId }) => {
      // Emit ONLY to the recipient, not to sender
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', message);
      }
    });

    // User is typing
    socket.on('typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('userTyping', { userId, conversationId });
    });

    // User stopped typing
    socket.on('stopTyping', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('userStopTyping', { userId, conversationId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
        socket.broadcast.emit('userOffline', socket.userId);
        console.log(`👋 User ${socket.userId} disconnected`);
      }
    });
  });
};

export const getOnlineUsers = () => {
  return Array.from(userSockets.keys());
};