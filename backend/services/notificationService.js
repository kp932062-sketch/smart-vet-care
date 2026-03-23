// Push Notification Service
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.messaging = null;
    
    try {
      // Check if Firebase config exists
      const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require('../config/firebase-service-account.json');
        
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
          });
        }
        this.messaging = admin.messaging();
        this.isInitialized = true;
        console.log('✅ Firebase notification service initialized');
      } else {
        console.log('⚠️  Firebase config not found - notifications will be simulated');
        this.isInitialized = false;
      }
    } catch (error) {
      console.log('⚠️  Firebase initialization failed:', error.message);
      this.isInitialized = false;
    }
  }

  // Send notification to single device
  async sendToDevice(token, notification, data = {}) {
    if (!this.isInitialized) {
      console.log('📱 [SIMULATED] Push notification to device:', {
        token: token.substring(0, 20) + '...',
        title: notification.title,
        body: notification.body
      });
      return { success: true, messageId: 'simulated-' + Date.now(), simulation: true };
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      token
    };

    try {
      const response = await this.messaging.send(message);
      console.log('✅ Notification sent successfully:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification to multiple devices
  async sendToMultipleDevices(tokens, notification, data = {}) {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      tokens
    };

    try {
      const response = await this.messaging.sendMulticast(message);
      console.log('✅ Batch notification sent:', {
        successful: response.successCount,
        failed: response.failureCount
      });
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      console.error('❌ Failed to send batch notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification to topic (user groups)
  async sendToTopic(topic, notification, data = {}) {
    if (!this.isInitialized) {
      console.log('📱 [SIMULATED] Topic notification:', {
        topic,
        title: notification.title,
        body: notification.body
      });
      return { success: true, messageId: 'simulated-topic-' + Date.now(), simulation: true };
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      topic
    };

    try {
      const response = await this.messaging.send(message);
      console.log('✅ Topic notification sent successfully:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('❌ Failed to send topic notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Subscribe user to topic
  async subscribeToTopic(tokens, topic) {
    try {
      const response = await this.messaging.subscribeToTopic(tokens, topic);
      console.log('✅ Successfully subscribed to topic:', topic);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Failed to subscribe to topic:', error);
      return { success: false, error: error.message };
    }
  }

  // Unsubscribe user from topic
  async unsubscribeFromTopic(tokens, topic) {
    try {
      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      console.log('✅ Successfully unsubscribed from topic:', topic);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Failed to unsubscribe from topic:', error);
      return { success: false, error: error.message };
    }
  }

  // Predefined notification templates
  getNotificationTemplates() {
    return {
      appointmentConfirmed: (doctorName, date, time) => ({
        title: "Appointment Confirmed! ✅",
        body: `Your appointment with Dr. ${doctorName} is confirmed for ${date} at ${time}`,
        imageUrl: "https://your-domain.com/images/appointment-confirmed.png"
      }),

      appointmentReminder: (doctorName, time) => ({
        title: "Appointment Reminder 🔔",
        body: `Your appointment with Dr. ${doctorName} is starting in ${time}`,
        imageUrl: "https://your-domain.com/images/reminder.png"
      }),

      consultationReady: (doctorName) => ({
        title: "Doctor is Ready! 👨‍⚕️",
        body: `Dr. ${doctorName} is ready to start your consultation. Join now!`,
        imageUrl: "https://your-domain.com/images/consultation-ready.png"
      }),

      reportGenerated: (petName) => ({
        title: "Medical Report Ready 📋",
        body: `Medical report for ${petName} has been generated and is available for download`,
        imageUrl: "https://your-domain.com/images/report-ready.png"
      }),

      emergencyAlert: (message) => ({
        title: "Emergency Alert 🚨",
        body: message,
        imageUrl: "https://your-domain.com/images/emergency.png"
      }),

      doctorApproved: (doctorName) => ({
        title: "Welcome to SmartVet!",
        body: `Congratulations Dr. ${doctorName}! Your application has been approved.`,
        imageUrl: "https://your-domain.com/images/doctor-approved.png"
      }),

      vaccinationReminder: (petName, vaccine, dueDate) => ({
        title: "Vaccination Due 💉",
        body: `${petName} is due for ${vaccine} vaccination on ${dueDate}`,
        imageUrl: "https://your-domain.com/images/vaccination.png"
      }),

      paymentSuccessful: (amount, appointmentId) => ({
        title: "Payment Successful ✅",
        body: `Payment of ₹${amount} for appointment #${appointmentId} was successful`,
        imageUrl: "https://your-domain.com/images/payment-success.png"
      }),

      newMessage: (senderName) => ({
        title: "New Message 💬",
        body: `You have a new message from ${senderName}`,
        imageUrl: "https://your-domain.com/images/new-message.png"
      })
    };
  }

  // Smart notification based on user preferences and optimal timing
  async sendSmartNotification(userId, templateName, templateData, options = {}) {
    try {
      // Get user preferences and optimal timing
      const user = await User.findById(userId);
      if (!user || !user.preferences.notifications.push) {
        return { success: false, reason: 'User opted out of push notifications' };
      }

      // Check if it's optimal timing (not during sleep hours)
      const now = new Date();
      const hour = now.getHours();
      const isOptimalTime = hour >= 8 && hour <= 22; // 8 AM to 10 PM

      if (!options.forceSend && !isOptimalTime) {
        // Schedule for later
        return this.scheduleNotification(userId, templateName, templateData, options);
      }

      const templates = this.getNotificationTemplates();
      const notification = templates[templateName](...templateData);

      if (user.fcmToken) {
        return await this.sendToDevice(user.fcmToken, notification, {
          userId: userId.toString(),
          template: templateName,
          ...options.data
        });
      }

      return { success: false, reason: 'No FCM token found' };
    } catch (error) {
      console.error('❌ Smart notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule notification for optimal timing
  async scheduleNotification(userId, templateName, templateData, options = {}) {
    // This would integrate with a job queue like Bull or Agenda
    // For now, just log the scheduling
    console.log(`📅 Scheduled notification for user ${userId}:`, {
      template: templateName,
      data: templateData,
      scheduledFor: options.scheduledFor || 'next optimal time'
    });

    return { success: true, scheduled: true };
  }

  // Simple notification method for route compatibility
  async sendNotification(userId, notification) {
    try {
      // Import User model here to avoid circular dependencies
      const User = require('../models/User');
      
      // Get user with devices
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Save notification to database
      const Notification = require('../models/Notification');
      const dbNotification = new Notification({
        user: userId,
        title: notification.title,
        body: notification.body,
        type: notification.type || 'general',
        data: notification.data || {},
        isRead: false
      });
      await dbNotification.save();

      // Send push notification if user has active devices
      const activeDevices = user.devices?.filter(device => device.isActive) || [];
      
      if (activeDevices.length > 0 && this.isInitialized) {
        const pushResults = await Promise.allSettled(
          activeDevices.map(device => 
            this.sendToDevice(device.fcmToken, notification, notification.data)
          )
        );
        
        const successCount = pushResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
        console.log(`📱 Push notifications sent: ${successCount}/${activeDevices.length} devices`);
      } else if (activeDevices.length > 0) {
        console.log(`📱 [SIMULATED] Push notification to ${activeDevices.length} devices for user ${userId}`);
      }

      return { 
        success: true, 
        notificationId: dbNotification._id,
        pushSent: activeDevices.length > 0
      };

    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();