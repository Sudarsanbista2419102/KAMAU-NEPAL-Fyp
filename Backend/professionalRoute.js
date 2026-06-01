import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  registerProfessional,
  getProfessionalProfile,
  getAllProfessionals,
  searchProfessionals,
  updateProfessionalProfile,
  getPendingApplications,
  verifyProfessional,
  deleteProfessionalProfile,
  getProfessionalByUsername,
  getMyProfessionalProfile,
  getServiceCategories,
  getServiceAreas
} from './controllers/professionalController.js';
import { verifyToken } from './authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const uploadDir = './uploads/professionals';

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB limit
    fieldSize: 50 * 1024 * 1024  // 50MB for base64 strings/fields
  }
});

// Routes

// Register a new professional
// POST /api/professionals/register
// Expects: multipart/form-data with profileImage and document_0, document_1, etc.
router.post('/register', verifyToken, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]), registerProfessional);

// Get current user's professional profile
// GET /api/professionals/me
router.get('/me', verifyToken, getMyProfessionalProfile);

// Get all professionals (verified only by default)
// GET /api/professionals?page=1&limit=10&serviceCategory=plumbing&serviceArea=thamel&verificationStatus=verified
router.get('/', getAllProfessionals);

// Get all unique service categories & areas
// GET /api/professionals/categories
router.get('/categories', getServiceCategories);

// GET /api/professionals/areas
router.get('/areas', getServiceAreas);

// Search professionals by filters
// GET /api/professionals/search?serviceCategory=plumbing&serviceArea=thamel
router.get('/search', searchProfessionals);

// Get professional by username
// GET /api/professionals/user/:username
router.get('/user/:username', getProfessionalByUsername);

// Admin routes (must be before /:id to avoid being matched as an ID)

// Get pending applications for verification
// GET /api/professionals/admin/pending?page=1&limit=10
router.get('/admin/pending', getPendingApplications);

// Verify or reject professional
// PATCH /api/professionals/admin/verify/:id
// Expects: { status: 'verified' or 'rejected', rejectionReason: 'optional reason' }
router.patch('/admin/verify/:id', verifyProfessional);

// Get professional profile by ID
// GET /api/professionals/:id
router.get('/:id', getProfessionalProfile);

// Update professional profile
// PUT /api/professionals/:id
// Expects: multipart/form-data (optional profileImage, coverImage)
router.put('/:id', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), updateProfessionalProfile);

// Delete professional profile
// DELETE /api/professionals/:id
router.delete('/:id', deleteProfessionalProfile);

export default router;
