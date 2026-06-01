import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  sendMessage,
  getMyMessages,
  updateMessageStatus,
  deleteMessage,
  getConversations,
  getMessageThread,
  getUnreadCount
} from './controllers/messageController.js';
import { verifyToken } from './authMiddleware.js';

import sharp from 'sharp';


const router = express.Router();

// Configure multer for message attachments
const uploadDir = './uploads/messages';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB
    fieldSize: 50 * 1024 * 1024  // 50MB for field data
  } 
});

// All message routes require authentication
router.use(verifyToken);

// Upload attachment
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  let finalFilename = req.file.filename;
  let finalUrl = `/uploads/messages/${req.file.filename}`;

  // Optimize if it's an image
  if (req.file.mimetype.startsWith('image/')) {
    const optimizedFilename = `opt-${req.file.filename.split('.')[0]}.webp`;
    const optimizedPath = path.join(uploadDir, optimizedFilename);
    
    try {
      await sharp(req.file.path)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(optimizedPath);
      
      // Delete original
      fs.unlinkSync(req.file.path);
      finalFilename = optimizedFilename;
      finalUrl = `/uploads/messages/${optimizedFilename}`;
    } catch (err) {
      console.error('Sharp optimization failed for message attachment:', err);
      // Fallback to original file
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      url: finalUrl,
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    }
  });
});

// Send a message
router.post('/', sendMessage);

// Get unread messages count
router.get('/unread-count', getUnreadCount);

// Get all conversations list
router.get('/conversations', getConversations);

// Get message thread with a specific user
router.get('/thread/:otherUserId', getMessageThread);

// Get messages for user (supports query param ?category=inbox|sent|archived|starred)
router.get('/', getMyMessages);

// Update message status
router.patch('/:id', updateMessageStatus);

// Delete message
router.delete('/:id', deleteMessage);

export default router;
