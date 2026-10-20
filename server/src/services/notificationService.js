const Notification = require('../models/Notification');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

const createNotification = async ({ userId, type, title, message, relatedId = null }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

const notifyAdmins = async ({ type, title, message, relatedId = null }) => {
  try {
    const admins = await User.find({ role: ROLES.ADMIN, isActive: true }).select('_id');
    const notifications = await Promise.all(
      admins.map(admin =>
        Notification.create({
          userId: admin._id,
          type,
          title,
          message,
          relatedId
        })
      )
    );
    return notifications;
  } catch (error) {
    console.error('Error notifying admins:', error.message);
  }
};

module.exports = {
  createNotification,
  notifyAdmins
};
