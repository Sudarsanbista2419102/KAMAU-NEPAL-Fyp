import Message from '../models/messageModel.js';
import User from '../models/userModel.js';

/**
 * Send a new message
 */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, subject, content, attachments } = req.body;
    const senderId = req.user.id; // From authMiddleware

    if (!receiverId || (!content && !attachments)) {
      return res.status(400).json({ success: false, message: 'Receiver and content or attachment are required' });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      subject: subject || '(No Subject)',
      content: content || '(Attachment only)',
      attachments: attachments || []
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all messages for the authenticated user
 */
export const getMyMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query; // inbox, sent, archived, starred

    let query = {};

    if (category === 'sent') {
      query = { sender: userId, senderDeleted: false, isArchived: false };
    } else if (category === 'archived') {
      query = {
        $or: [
          { sender: userId, isArchived: true, senderDeleted: false },
          { receiver: userId, isArchived: true, receiverDeleted: false }
        ]
      };
    } else if (category === 'starred') {
      query = {
        $or: [
          { sender: userId, isStarred: true, senderDeleted: false },
          { receiver: userId, isStarred: true, receiverDeleted: false }
        ]
      };
    } else {
      // Default: inbox
      query = { receiver: userId, receiverDeleted: false, isArchived: false };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name profileImage email')
      .populate('receiver', 'name profileImage email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark message as read/starred/archived
 */
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead, isStarred, isArchived } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check permissions
    if (message.sender.toString() !== userId && message.receiver.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (isRead !== undefined) message.isRead = isRead;
    if (isStarred !== undefined) message.isStarred = isStarred;
    if (isArchived !== undefined) message.isArchived = isArchived;

    await message.save();

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * "Delete" message for a specific user (soft delete)
 */
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() === userId) {
      message.senderDeleted = true;
    } else if (message.receiver.toString() === userId) {
      message.receiverDeleted = true;
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await message.save();

    // If both deleted, actually remove from DB? (optional)
    if (message.senderDeleted && message.receiverDeleted) {
      await Message.findByIdAndDelete(id);
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * Get all conversations for the authenticated user (grouped by the other person)
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all messages involving the user
    const messages = await Message.find({
      $or: [
        { sender: userId, senderDeleted: false },
        { receiver: userId, receiverDeleted: false }
      ]
    })
    .populate('sender', 'name profileImage email')
    .populate('receiver', 'name profileImage email')
    .sort({ createdAt: -1 });

    // Group by the "other" person
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      const otherId = otherUser._id.toString();

      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          otherUser,
          lastMessage: msg,
          unreadCount: (msg.receiver._id.toString() === userId.toString() && !msg.isRead) ? 1 : 0
        });
      } else {
        if (msg.receiver._id.toString() === userId.toString() && !msg.isRead) {
          conversationsMap.get(otherId).unreadCount++;
        }
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all messages between the authenticated user and another user
 */
export const getMessageThread = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId, senderDeleted: false },
        { sender: otherUserId, receiver: userId, receiverDeleted: false }
      ]
    })
    .populate('sender', 'name profileImage email')
    .populate('receiver', 'name profileImage email')
    .sort({ createdAt: 1 }); // Oldest to newest for chat

    // Mark messages from the other user as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get total unread messages count for the authenticated user
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({
      receiver: userId,
      receiverDeleted: false,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
