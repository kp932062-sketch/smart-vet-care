import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm'
        }`}
      >
        <p className="break-words whitespace-pre-wrap">{message.message}</p>
        <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
