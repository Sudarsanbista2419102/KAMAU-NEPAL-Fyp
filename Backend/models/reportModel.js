import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'reporterModel'
  },
  reporterModel: {
    type: String,
    required: true,
    enum: ['User', 'Professional']
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    required: true,
    enum: ['User', 'Professional']
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'Inappropriate Behavior',
      'Unprofessional Service',
      'Fraud/scam',
      'Fake Profile',
      'Late arrival',
      'Poor service',
      'Harassment',
      'Payment Issues',
      'Overcharging',
      'Safety Concerns',
      'Fake Booking',
      'No Show',
      'Unreasonable Demands',
      'Other'
    ]
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved', 'Dismissed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  adminNotes: {
    type: String
  }
});

// Index for faster duplicate report checking
reportSchema.index({ reporter: 1, target: 1, reporterModel: 1, targetModel: 1 });

// Index for admin queries
reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
