import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";

// Create a notification (internal utility)
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link = "",
  data = {},
}) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      data,
    });
  } catch (err) {
    console.error("Notification creation error:", err.message);
  }
};

// GET /api/notifications
export const getNotifications = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ user: req.user._id });
  const unread = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });

  res.json({
    success: true,
    notifications,
    total,
    unread,
    page,
    pages: Math.ceil(total / limit),
  });
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!notification) throw new ApiError("Notification not found", 404);

  notification.read = true;
  await notification.save();

  res.json({ success: true, notification });
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true },
  );
  res.json({ success: true, message: "All notifications marked as read" });
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  res.json({ success: true, message: "Notification deleted" });
};

// DELETE /api/notifications/clear-all
export const clearAllNotifications = async (req, res) => {
  await Notification.deleteMany({ user: req.user._id, read: true });
  res.json({ success: true, message: "Read notifications cleared" });
};
