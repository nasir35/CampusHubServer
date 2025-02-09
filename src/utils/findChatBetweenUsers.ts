import {Chat} from "../models/Chat";
export const findChatBetweenUsers = async (senderId: string, receiverId: string) => {
  try {
    const chat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });

    return chat;
  } catch (error) {
    console.error("Error finding chat:", error);
    return null;
  }
};
