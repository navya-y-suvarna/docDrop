const Notification = require("../models/Notification");

class NotificationService {
  /**
   * Send notification to user
   */
  static async send(userId, { title, message, type = "info", link = null }) {
    return await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      link,
    });
  }
}

module.exports = NotificationService;
