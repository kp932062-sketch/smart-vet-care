import React from 'react';

const ChatList = ({ chats, selectedChatId, onSelectChat }) => {
  if (!chats.length) {
    return (
      <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No conversations yet.</div>
    );
  }

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {chats.map((chat) => {
        const active = Number(selectedChatId) === Number(chat.id);
        return (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`w-full text-left p-3 transition-colors ${
              active
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{chat.user?.name || `User #${chat.userId}`}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{chat.lastMessage || 'No messages yet'}</p>
          </button>
        );
      })}
    </div>
  );
};

export default ChatList;
