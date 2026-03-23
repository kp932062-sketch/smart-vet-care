import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import ChatList from '../chat/ChatList';
import ChatWindow from '../chat/ChatWindow';

const AdminChatPanel = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/chat/conversations');
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setChats(data);
      if (data.length > 0) {
        setSelectedChat((prev) => prev || data[0]);
      } else {
        setSelectedChat(null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load conversations.');
      setChats([]);
      setSelectedChat(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Chat Inbox</h2>
        <button onClick={loadConversations} className="px-3 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium">
          Refresh
        </button>
      </div>

      {loading && <Loader label="Loading conversations..." />}

      {!loading && error && (
        <div className="text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && chats.length === 0 && (
        <EmptyState icon="📭" title="No conversations yet" description="User chats will appear here once a message is sent." />
      )}

      {!loading && chats.length > 0 && (
        <div className="grid lg:grid-cols-[320px_1fr] gap-4 min-h-[560px]">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
            <ChatList
              chats={chats}
              selectedChatId={selectedChat?.id}
              onSelectChat={setSelectedChat}
            />
          </div>
          <ChatWindow
            chatId={selectedChat?.id}
            currentRole="admin"
            title={selectedChat ? `Chat with ${selectedChat.user?.name || 'User'}` : 'Chat'}
          />
        </div>
      )}
    </div>
  );
};

export default AdminChatPanel;
