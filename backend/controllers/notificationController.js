const Notification = require("../models/Notification");

const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.listByUser(req.user.id);
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("List notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.markAsRead(id, req.user.id);
    res.json({ message: "Notification marked as read", notification: updated });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
};
