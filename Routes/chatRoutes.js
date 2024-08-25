import express from "express";
import mongoose from "mongoose";
import User from "../models/user.js";
import Chat from "../models/chat.js";
import Messages from "../models/message.js";
import { check } from "../jwt/genrateToken.js";
const routes = express.Router();
routes.get("/user", check, async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  try {
    const users = await User.find(keyword)
      .select("-password")
      .find({ _id: { $ne: req.user._id } });
    res.status(200).json(users);
    
  } catch (error) {
    
    res.status(500).json({ message: "Error fetching users" });
  }
});

routes.post("/create", check, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "No user ID provided" });
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      return res.status(200).json(isChat[0]);
    }

    const chatData = {
      chatName: req.user._id,
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const newChat = await Chat.create(chatData);

    const fullChat = await Chat.findOne({ _id: newChat._id }).populate(
      "users",
      "-password",
    );
req.io.emit('newChat', fullChat)
    res.status(200).json(fullChat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating or fetching chat" });
  }
});

routes.get("/chat", check, async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching chats" });
  }
});

routes.post("/create/message", check, async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Content and chatId are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chat ID" });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isUserInChat = chat.users.some((user) => user.equals(req.user._id));

    if (!isUserInChat) {
      return res.status(403).json({
        message: "You are not authorized to send messages in this chat",
      });
    }

    const newMessage = {
      sender: req.user._id,
      content,
      chat: chatId,
    };

    let message = await Messages.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    // Emit 'newUpdate' to let the backend know that a new message has been created
    //emiting setting

    req.io.emit("newUpdate", message);

    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending message" });
  }
});

routes.get("/chat/:chatId", check, async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chat ID" });
  }

  try {
    const chat = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("latestMessage");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isUserInChat = chat.users.some((user) => user.equals(req.user._id));

    if (!isUserInChat) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to see messages in this chat",
        });
    }

    const messages = await Messages.find({ chat: chatId }).populate(
      "sender",
      "name pic email",
    );

    const chatWithMessages = {
      ...chat.toObject(),
      messages: messages || [],
    };

    // Emit the full chat when requested by the client
    res.status(200).json(chatWithMessages);

    // Listen for 'newUpdate' to emit the full chat data to all clients
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching chat and messages" });
  }
});
export default routes;
