import { useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';

export default function ConversationList({ conversations, selectedConversation, onSelectConversation, currentUserId }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants.find(p => p._id !== currentUserId);
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getOtherUser = (conversation) => {
    return conversation.participants.find(p => p._id !== currentUserId);
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <MessageSquare size={24} className="text-blue-600" />
          Messages
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Start chatting with your connections!</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const isSelected = selectedConversation?._id === conversation._id;
            const hasUnread = conversation.unreadCount > 0;

            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation)}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : ''
                } ${hasUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                {/* Avatar */}
                <div className="relative">
                  {otherUser?.profilePic ? (
                    <img
                      src={otherUser.profilePic}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {otherUser?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  {/* Unread indicator dot */}
                  {hasUnread && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className={`font-semibold truncate ${hasUnread ? 'text-blue-600' : ''}`}>
                      {otherUser?.name || 'Unknown'}
                    </p>
                    {conversation.lastMessageAt && (
                      <span className={`text-xs flex-shrink-0 ml-2 ${hasUnread ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {conversation.lastMessage.sender === currentUserId ? 'You: ' : ''}
                      {conversation.lastMessage.text}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {otherUser?.department} • {otherUser?.year}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}