import React, { useState } from 'react';
import api from '../../utils/api';
import FormInput from '../common/FormInput';

const DoctorNotificationPanel = ({ doctorId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState({
    recipientId: '',
    title: '',
    message: '',
    type: 'consultation_update',
    priority: 'medium'
  });

  const handleSendNotification = async () => {
    if (!notification.recipientId || !notification.title || !notification.message) {
      setMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/notifications/send-to-user', notification);
      setMessage(`✅ Notification sent successfully to patient`);
      setNotification({ 
        recipientId: '', 
        title: '', 
        message: '', 
        type: 'consultation_update', 
        priority: 'medium' 
      });
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || 'Failed to send notification'}`);
    } finally {
      setLoading(false);
    }
  };

  const quickTemplates = {
    reportReady: {
      title: '📋 Medical Report Ready',
      message: 'Your medical report is now ready for review. Please check your dashboard for detailed results and recommendations.'
    },
    appointmentReminder: {
      title: '⏰ Appointment Reminder',
      message: 'This is a reminder for your upcoming appointment scheduled for [DATE] at [TIME]. Please ensure you have your pet ready for the consultation.'
    },
    followUp: {
      title: '🩺 Follow-up Required',
      message: 'Based on your recent consultation, a follow-up appointment is recommended. Please schedule your next visit within [TIMEFRAME].'
    },
    medicationReminder: {
      title: '💊 Medication Reminder',
      message: 'Please remember to give your pet the prescribed medication as discussed during the consultation. Follow the dosage instructions carefully.'
    },
    emergencyContact: {
      title: '🚨 Emergency Contact',
      message: 'If your pet shows any of the symptoms we discussed, please contact our emergency helpline immediately at [PHONE NUMBER].'
    },
    paymentDue: {
      title: '💳 Payment Due',
      message: 'Your consultation fee payment is now due. Please complete the payment through your dashboard to receive your medical report.'
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-green-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">👨‍⚕️ Doctor Notification Panel</h2>
              <p className="text-blue-100">Send updates and notifications to your patients</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Send Notification Form */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Send Patient Notification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient User ID *
                </label>
                <FormInput
                  type="text"
                  label=""
                  value={notification.recipientId}
                  onChange={(e) => setNotification({...notification, recipientId: e.target.value})}
                  placeholder="Enter patient user ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Type
                </label>
                <select
                  value={notification.type}
                  onChange={(e) => setNotification({...notification, type: e.target.value})}
                  className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="consultation_update">Consultation Update</option>
                  <option value="appointment_reminder">Appointment Reminder</option>
                  <option value="report_ready">Report Ready</option>
                  <option value="medication_reminder">Medication Reminder</option>
                  <option value="follow_up_required">Follow-up Required</option>
                  <option value="emergency_alert">Emergency Alert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <FormInput
                  type="text"
                  label=""
                  value={notification.title}
                  onChange={(e) => setNotification({...notification, title: e.target.value})}
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={notification.priority}
                  onChange={(e) => setNotification({...notification, priority: e.target.value})}
                  className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={notification.message}
                onChange={(e) => setNotification({...notification, message: e.target.value})}
                rows="4"
                className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                placeholder="Enter your notification message"
              />
            </div>

            <button
              onClick={handleSendNotification}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : '📤 Send Notification'}
            </button>
          </div>

          {/* Quick Templates */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(quickTemplates).map(([key, template]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{template.title}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.message}</p>
                  <button
                    onClick={() => {
                      setNotification({
                        ...notification,
                        title: template.title,
                        message: template.message,
                        type: key === 'reportReady' ? 'report_ready' : 
                              key === 'appointmentReminder' ? 'appointment_reminder' :
                              key === 'followUp' ? 'follow_up_required' :
                              key === 'medicationReminder' ? 'medication_reminder' :
                              key === 'emergencyContact' ? 'emergency_alert' :
                              key === 'paymentDue' ? 'consultation_update' : 'consultation_update'
                      });
                    }}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Patients Info */}
          <div className="border-t pt-4 mt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="font-medium text-yellow-800 text-sm mb-1">💡 Pro Tip</h4>
              <p className="text-xs text-yellow-700">
                To find patient user IDs, check your appointment list or consultation history. 
                User IDs are displayed in the patient details section of each appointment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorNotificationPanel;