import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.connected = true;
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('joinConversation', conversationId);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('leaveConversation', conversationId);
    }
  }

  // Send message
  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('sendMessage', data);
    }
  }

  // Typing indicator
  startTyping(conversationId, userId) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, userId });
    }
  }

  stopTyping(conversationId, userId) {
    if (this.socket) {
      this.socket.emit('stopTyping', { conversationId, userId });
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  // Listen for typing
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('userStopTyping', callback);
    }
  }

  // Online/offline status
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('userOnline', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('userOffline', callback);
    }
  }

  // Remove listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();