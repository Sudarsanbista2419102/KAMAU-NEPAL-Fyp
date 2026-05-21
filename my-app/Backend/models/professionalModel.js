import mongoose from 'mongoose';

const professionalSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for legacy or guest registrations, but will be set for logged-in users
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Prefer not to say'],
    default: 'Prefer not to say'
  },
  serviceCategory: {
    type: String,
    required: true,
  },
  tools: {
    type: [String],
    default: []
  },
  serviceArea: {
    type: String,
    required: true,
  },
  hourlyWage: {
    type: Number,
    required: false
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  profileImage: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  verificationDocuments: [{
    filename: String,
    path: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  liveStatus: {
    type: String,
    enum: ['Free', 'Ongoing', 'Offline'],
    default: 'Free'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }
  },
  formattedAddress: { type: String },
  jobType: {
    type: String,
    enum: ['part-time', 'full-time'],
    default: 'full-time'
  },
  availability: [{
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }],
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedUntil: {
    type: Date,
    default: null
  },
  totalReports: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster searches
professionalSchema.index({ serviceCategory: 1, serviceArea: 1, verificationStatus: 1 });
professionalSchema.index({ email: 1 });
professionalSchema.index({ username: 1 });
professionalSchema.index({ location: "2dsphere" });

const ProfessionalModel = mongoose.model('Professional', professionalSchema);

export default ProfessionalModel;
