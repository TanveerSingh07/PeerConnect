import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { messageAPI } from "../services/api";
import { getCurrentUser } from "../services/auth";
import socketService from "../services/socket";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import { MessageSquare } from "lucide-react";
import { toast } from "react-toastify";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Connect to Socket.io
    if (currentUser?._id) {
      socketService.connect(currentUser._id);
    }

    fetchConversations();

    // Check if opening chat with specific user
    const userId = searchParams.get("userId");
    if (userId) {
      handleStartConversation(userId);
    }

    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation._id);
      }
    };
  }, []);

  // Listen for new messages in real-time
  useEffect(() => {
    const handleNewMessage = (message) => {
      // Update conversation list with new last message
      setConversations((prev) =>
        prev
          .map((conv) => {
            if (conv._id === message.conversation) {
              // ✅ Increment unread count if not current conversation
              const isCurrentConversation =
                selectedConversation?._id === message.conversation;
              return {
                ...conv,
                lastMessage: message,
                lastMessageAt: new Date(),
                unreadCount: isCurrentConversation
                  ? conv.unreadCount
                  : (conv.unreadCount || 0) + 1,
              };
            }
            return conv;
          })
          .sort(
            (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
          ),
      );
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.off("newMessage", handleNewMessage);
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data } = await messageAPI.getConversations();
      setConversations(removeDuplicates(data));
    } catch (error) {
      console.error("Fetch conversations error:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (userId) => {
    try {
      const { data } = await messageAPI.getOrCreateConversation(userId);

      const conversationWithCount = { ...data, unreadCount: 0 };
      setSelectedConversation(conversationWithCount);

      setConversations((prev) => {
        const exists = prev.find((c) => c._id === data._id);
        if (exists) return prev;

        return [conversationWithCount, ...prev];
      });

      socketService.joinConversation(data._id);
    } catch (error) {
      console.error("Start conversation error:", error);
      toast.error("Failed to start conversation");
    }
  };

  const removeDuplicates = (list) => {
    const map = new Map();

    list.forEach((conv) => {
      const key = conv.participants
        .map((p) => p._id)
        .sort()
        .join("_");

      if (!map.has(key)) {
        map.set(key, conv);
      }
    });

    return Array.from(map.values());
  };

  const handleSelectConversation = async (conversation) => {
    if (selectedConversation?._id) {
      socketService.leaveConversation(selectedConversation._id);
    }

    setSelectedConversation(conversation);
    socketService.joinConversation(conversation._id);

    // ✅ Reset unread count immediately in UI
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv,
      ),
    );

    // Mark as read in backend
    try {
      await messageAPI.markAsRead(conversation._id);
      // Trigger navbar count update
      window.dispatchEvent(new CustomEvent("messageRead"));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading messages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="flex h-full">
        {/* Conversation List Sidebar */}
        <div
          className={`${selectedConversation ? "hidden md:block" : "block"} w-full md:w-80 border-r border-gray-200 dark:border-gray-700`}
        >
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            currentUserId={currentUser._id}
          />
        </div>

        {/* Chat Window */}
        <div
          className={`${selectedConversation ? "block" : "hidden md:block"} flex-1`}
        >
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUser={currentUser}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={64} className="mb-4" />
              <p className="text-lg">
                Select a conversation to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
