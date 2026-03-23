import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../utils/api';
import socket from '../../utils/socket';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatWindow = ({ chatId, currentRole = 'user', title = 'Chat' }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const normalizedRole = useMemo(() => (currentRole === 'admin' ? 'admin' : 'user'), [currentRole]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/chat/${chatId}`);
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        if (mounted) {
          setMessages(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Failed to load chat messages.');
          setMessages([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_chat', { chatId: Number(chatId) });

    const onReceiveMessage = (message) => {
      if (Number(message?.chatId) !== Number(chatId)) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((row) => Number(row.id) === Number(message.id))) {
          return prev;
        }
        return [...prev, message];
      });
    };

    socket.on('receive_message', onReceiveMessage);

    return () => {
      mounted = false;
      socket.off('receive_message', onReceiveMessage);
    };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!chatId || !text.trim()) {
      return false;
    }

    setSending(true);
    setError('');
    try {
      await api.post('/chat/message', { chatId: Number(chatId), message: text.trim() });
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message.');
      return false;
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full min-h-[420px] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-blue-100">Real-time chat</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-slate-50/80 dark:bg-slate-900/50">
        {loading && <Loader label="Loading messages..." />}

        {!loading && error && (
          <div className="text-sm px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <EmptyState icon="💬" title="No messages yet" description="Start the conversation now." />
        )}

        {!loading && messages.length > 0 &&
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderRole === normalizedRole}
            />
          ))}

        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        disabled={sending || !chatId}
        placeholder="Type a message..."
      />
    </div>
  );
};

export default ChatWindow;
