import React, { useState } from 'react';

const ChatInput = ({ onSend, disabled = false, placeholder = 'Type a message...' }) => {
  const [value, setValue] = useState('');

  const submit = async () => {
    const text = value.trim();
    if (!text || disabled) return;
    const sent = await onSend(text);
    if (sent !== false) {
      setValue('');
    }
  };

  return (
    <div className="px-3 sm:px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 flex items-center gap-2">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="flex-1 rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed interactive-press"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;
