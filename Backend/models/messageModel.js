import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    default: '(No Subject)'
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  senderDeleted: {
    type: Boolean,
    default: false
  },
  receiverDeleted: {
    type: Boolean,
    default: false
  },
  attachments: [{
    url: String,
    filename: String,
    fileType: String,
    fileSize: Number
  }]
}, { timestamps: true });

// Helper to determine category for a specific user
messageSchema.methods.getCategoryForUser = function(userId) {
  if (this.isArchived) return 'archived';
  if (this.sender.toString() === userId.toString()) return 'sent';
  if (this.receiver.toString() === userId.toString()) return 'inbox';
  return 'inbox';
};

const Message = mongoose.model('Message', messageSchema);
export default Message;
