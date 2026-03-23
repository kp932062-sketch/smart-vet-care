import React from 'react';

const ReactivationModal = ({ isOpen, onClose, onSubmit, reason, setReason, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Request Account Reactivation</h2>
        <p className="mb-2 text-gray-600">Please provide a reason for requesting reactivation:</p>
        <textarea
          className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 mb-4 min-h-[80px]"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Enter your reason (required)"
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onSubmit}
            disabled={!reason || reason.trim().length < 3 || loading}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactivationModal;
