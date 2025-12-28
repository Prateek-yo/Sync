import Message from "../models/Message.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get conversations for sidebar (only users with existing chats)
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate({
        path: 'participants',
        select: '-password',
        match: { _id: { $ne: userId } }
      })
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 });

    // Format response with user details and unseen message count
    const conversationsData = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUser = conversation.participants.find(p => p && p._id.toString() !== userId.toString());

        if (!otherUser) return null;

        // Count unseen messages from this user
        const unseenCount = await Message.countDocuments({
          senderId: otherUser._id,
          receiverId: userId,
          seen: false
        });

        return {
          _id: otherUser._id,
          fullName: otherUser.fullName,
          email: otherUser.email,
          profilePic: otherUser.profilePic,
          avatar: otherUser.avatar,
          bio: otherUser.bio,
          conversationId: conversation._id,
          lastMessage: conversation.lastMessage,
          lastMessageTime: conversation.lastMessageTime,
          unseenCount
        };
      })
    );

    // Filter out null values
    const validConversations = conversationsData.filter(c => c !== null);

    res.json({ success: true, conversations: validConversations });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Search users for starting new conversations
export const searchUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ success: true, users: [] });
    }

    // Search users by name or email (exclude current user)
    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
      .select('-password')
      .limit(15);

    res.json({ success: true, users });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//get all message for selected user

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId }
      ]
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );

    res.json({ success: true, messages })
  }
  catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message })
  }
}

//api to mark messg as seen using message id

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true })
    res.json({ success: true })
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message })
  }
}

// Send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl
    })

    // Create or update conversation
    let conversation = await Conversation.findConversationBetween(senderId, receiverId);

    if (!conversation) {
      // Create new conversation if doesn't exist
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        lastMessage: newMessage._id,
        lastMessageTime: new Date()
      });
    } else {
      // Update existing conversation
      conversation.lastMessage = newMessage._id;
      conversation.lastMessageTime = new Date();
      await conversation.save();
    }

    // Emit the new message to the receiver's socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      // Also emit conversation update
      io.to(receiverSocketId).emit("conversationUpdated", conversation);
    }

    res.json({ success: true, newMessage });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message })
  }
}

// Edit message
export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);

    if (!message) {
      return res.json({ success: false, message: 'Message not found' });
    }

    // Verify user is the sender
    if (message.senderId.toString() !== userId.toString()) {
      return res.json({ success: false, message: 'Unauthorized' });
    }

    // Update message
    message.text = text;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    // Emit socket event to receiver
    const receiverSocketId = userSocketMap[message.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messageEdited', message);
    }

    res.json({ success: true, message });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);

    if (!message) {
      return res.json({ success: false, message: 'Message not found' });
    }

    // Verify user is the sender
    if (message.senderId.toString() !== userId.toString()) {
      return res.json({ success: false, message: 'Unauthorized' });
    }

    // Soft delete
    message.deleted = true;
    message.text = null;
    message.image = null;
    await message.save();

    // Emit socket event to receiver
    const receiverSocketId = userSocketMap[message.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messageDeleted', { messageId: id });
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

