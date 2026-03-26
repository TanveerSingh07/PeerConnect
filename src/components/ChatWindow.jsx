import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { messageAPI } from '../services/api';
import socketService from '../services/socket';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { toast } from 'react-toastify';

export default function ChatWindow({ conversation, currentUser, onBack }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherUser = conversation.participants.find(p => p._id !== currentUser._id);

  useEffect(() => {
    fetchMessages();

    const handleUserTyping = ({ userId, conversationId }) => {
      if (conversationId === conversation._id && userId !== currentUser._id) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ userId, conversationId }) => {
      if (conversationId === conversation._id && userId !== currentUser._id) {
        setIsTyping(false);
      }
    };

    const handleNewMessage = (message) => {
      if (message.conversation === conversation._id && message.sender._id !== currentUser._id) {
        setMessages(prev => [...prev, message]);
      }
    };

    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStopTyping(handleUserStopTyping);
    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.off('userTyping', handleUserTyping);
      socketService.off('userStopTyping', handleUserStopTyping);
      socketService.off('newMessage', handleNewMessage);
    };
  }, [conversation._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await messageAPI.getMessages(conversation._id);
      setMessages(data);
    } catch (error) {
      console.error('Fetch messages error:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const { data } = await messageAPI.sendMessage(conversation._id, messageText);
      setMessages(prev => [...prev, data.message]);
      socketService.socket.emit('newMessageSent', {
        conversationId: conversation._id,
        message: data.message,
        recipientId: data.recipientId
      });

      socketService.stopTyping(conversation._id, currentUser._id);
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    socketService.startTyping(conversation._id, currentUser._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(conversation._id, currentUser._id);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Clickable profile */}
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition"
          onClick={() => navigate(`/profile/${otherUser._id}`)}
        >
          {otherUser?.profilePic ? (
            <img
              src={otherUser.profilePic}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {otherUser?.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}

          <div>
            <h3 className="font-semibold hover:text-blue-600">{otherUser?.name || 'Unknown'}</h3>
            <p className="text-xs text-gray-500">
              {otherUser?.department} • {otherUser?.year}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.sender._id === currentUser._id}
              />
            ))}
            {isTyping && <TypingIndicator userName={otherUser?.name} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </form>
    </div>
  );
}