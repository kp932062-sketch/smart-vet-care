import React, { useState } from 'react';
import api from '../../utils/api';
import { useEffect } from 'react';
import socket from '../../utils/socket';

const SupportPanel = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineSupport, setOnlineSupport] = useState(3);

  useEffect(() => {
    socket.connect();
    setIsConnected(true);
    socket.on('chat-message', (msg) => {
      setChatLog((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('chat-message');
      socket.disconnect();
      setIsConnected(false);
    };
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadMsg('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/support/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMsg('File uploaded successfully!');
      setFile(null);
    } catch {
      setUploadMsg('Failed to upload file.');
    }
    setUploading(false);
  };

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    socket.emit('chat-message', chatMsg);
    setChatLog((prev) => [...prev, `You: ${chatMsg}`]);
    setChatMsg('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl p-3 sm:p-4 lg:p-6 max-h-[90vh] overflow-y-auto">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg sm:rounded-xl shadow-lg">
            <span className="text-white text-base sm:text-xl">🎧</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Support Center
          </h3>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-xs sm:text-sm text-gray-600 font-medium">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Support Stats - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200/30">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-emerald-600 text-lg sm:text-xl">👥</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-emerald-600 font-medium truncate">Online Support</p>
              <p className="text-lg sm:text-xl font-bold text-emerald-700">{onlineSupport}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200/30">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-blue-600 text-lg sm:text-xl">💬</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-blue-600 font-medium truncate">Messages</p>
              <p className="text-lg sm:text-xl font-bold text-blue-700">{chatLog.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200/30">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-purple-600 text-lg sm:text-xl">📄</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-purple-600 font-medium truncate">Files Shared</p>
              <p className="text-lg sm:text-xl font-bold text-purple-700">{file ? 1 : 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <span className="text-blue-600 text-lg sm:text-xl">💬</span>
          <label className="text-base sm:text-lg font-semibold text-gray-700">Live Chat Support</label>
        </div>
        <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 h-32 sm:h-48 overflow-y-auto mb-3 sm:mb-4 scrollbar-thin scrollbar-thumb-gray-300">
          {chatLog.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <span className="text-2xl sm:text-4xl mb-1 sm:mb-2 block">💬</span>
                <p className="text-xs sm:text-sm">No messages yet. Start a conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {chatLog.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl max-w-[85%] sm:max-w-xs ${
                    msg.startsWith('You:') 
                      ? 'bg-blue-500 text-white ml-auto' 
                      : 'bg-white/70 text-gray-700'
                  }`}
                >
                  <p className="text-xs sm:text-sm break-words">{msg}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <input
            className="flex-1 rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
            type="text"
            value={chatMsg}
            onChange={e => setChatMsg(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <button 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-shrink-0" 
            onClick={handleSendChat}
          >
            <span className="text-sm sm:text-base">📤</span>
          </button>
        </div>
      </div>

      {/* Video Call Section - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <span className="text-emerald-600 text-lg sm:text-xl">📹</span>
          <label className="text-base sm:text-lg font-semibold text-gray-700">Video Consultation</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          <button className="flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <span className="text-base sm:text-xl">📹</span>
            <span className="font-semibold text-sm sm:text-base">Start Video Call</span>
          </button>
          <button className="flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <span className="text-base sm:text-xl">📺</span>
            <span className="font-semibold text-sm sm:text-base">Screen Share</span>
          </button>
        </div>
      </div>

      {/* File Upload Section - Mobile Optimized */}
      <div className="mb-4 sm:mb-0">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <span className="text-purple-600 text-lg sm:text-xl">📤</span>
          <label className="text-base sm:text-lg font-semibold text-gray-700">Share Files & Images</label>
        </div>
        <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-white/40 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 transition-all duration-300">
          <input 
            type="file" 
            className="hidden" 
            id="file-upload"
            onChange={handleFileChange}
            accept="image/*,application/pdf,.doc,.docx"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="space-y-2 sm:space-y-3">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-3xl text-white">📤</span>
              </div>
              <div>
                <p className="text-sm sm:text-lg font-semibold text-gray-700 break-words">
                  {file ? file.name : 'Choose file to upload'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Images, PDFs, or documents up to 10MB
                </p>
              </div>
            </div>
          </label>
        </div>
        
        {file && (
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-blue-50/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-blue-200/30 gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <span className="text-blue-600 flex-shrink-0">📄</span>
              <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{file.name}</span>
            </div>
            <button 
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 text-xs sm:text-sm flex-shrink-0 ${
                uploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
              onClick={handleUpload} 
              disabled={uploading}
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload File'
              )}
            </button>
          </div>
        )}
        
        {uploadMsg && (
          <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
            uploadMsg.includes('successfully') 
              ? 'bg-emerald-50/80 border-emerald-200/50 text-emerald-700' 
              : 'bg-red-50/80 border-red-200/50 text-red-700'
          }`}>
            <div className="flex items-center space-x-2">
              {uploadMsg.includes('successfully') ? (
                <span>✅</span>
              ) : (
                <span>❌</span>
              )}
              <span className="font-medium text-xs sm:text-sm">{uploadMsg}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Help Section - Mobile Optimized */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-blue-200/30">
        <h4 className="font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center space-x-2 text-sm sm:text-base">
          <span className="text-blue-600">🎧</span>
          <span>Quick Help</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="text-gray-600">
            <p className="font-medium">Emergency: 24/7</p>
            <p>Call: +1-800-VET-CARE</p>
          </div>
          <div className="text-gray-600">
            <p className="font-medium">Support Hours:</p>
            <p>Mon-Fri: 8AM-8PM</p>
          </div>
        </div>
      </div>

      {/* Important Platform Tips Section */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-blue-50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-emerald-200/30">
        <h4 className="font-semibold text-emerald-700 mb-2 sm:mb-3 flex items-center space-x-2 text-sm sm:text-base">
          <span className="text-emerald-600">💡</span>
          <span>Important Platform Tips</span>
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
          <li><b>Check Your Email:</b> For important updates, appointment confirmations, and password resets, always check your email inbox.</li>
          <li><b>Spam/Junk Folder:</b> If you don’t see our emails, please check your spam or junk folder and mark SmartVet emails as “Not Spam.”</li>
          <li><b>Add Us to Contacts:</b> Add <a href="mailto:support@smartvet.com" className="text-blue-600 underline">support@smartvet.com</a> to your contacts to ensure you always receive our emails.</li>
          <li><b>Platform Notifications:</b> Key updates and reminders will also appear here in your SmartVet dashboard.</li>
          <li><b>Need Help?</b> For any issues, contact our support team at <a href="mailto:support@smartvet.com" className="text-blue-600 underline">support@smartvet.com</a> or visit the Support Center above.</li>
        </ul>
      </div>
    </div>
  );
};

export default SupportPanel;

