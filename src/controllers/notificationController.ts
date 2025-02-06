import Notification from "../models/Notification";

export const createNotification = async (recipient: string, sender: string, type: string, content: string, link?: string) => {
  try {
    const notification = new Notification({
      recipient,
      sender,
      type,
      content,
      link, // Include the link
      read: false,
    });

    await notification.save();
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
