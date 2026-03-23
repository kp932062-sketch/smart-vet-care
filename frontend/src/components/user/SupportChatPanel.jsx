import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import ChatWindow from '../chat/ChatWindow';

const SupportChatPanel = () => {
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadMyChat = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/chat/my');
        const id = response.data?.data?.id;
        if (mounted) {
          setChatId(id || null);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Failed to initialize support chat.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMyChat();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <Loader label="Loading support chat..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!chatId) {
    return (
      <EmptyState
        icon="💬"
        title="Support chat unavailable"
        description="Please refresh and try again."
      />
    );
  }

  return <ChatWindow chatId={chatId} currentRole="user" title="SmartVet Admin Support" />;
};

export default SupportChatPanel;
