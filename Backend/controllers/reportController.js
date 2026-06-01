import Report from '../models/reportModel.js';
import Booking from '../models/bookingModel.js';

export const createReport = async (req, res) => {
  try {
    const { 
      reporter, 
      reporterModel, 
      target, 
      targetModel, 
      reason, 
      description 
    } = req.body;

    if (!reporter || !reporterModel || !target || !targetModel || !reason || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if this reporter has already reported this target
    const existingReport = await Report.findOne({
      reporter,
      reporterModel,
      target,
      targetModel
    });

    if (existingReport) {
      return res.status(409).json({ 
        success: false, 
        message: 'You have already reported this person. Our admin team is reviewing your previous report.' 
      });
    }

    // Enforce "after service only" reporting for Professionals
    if (targetModel === 'Professional' && reporterModel === 'User') {
      const completedBooking = await Booking.findOne({
        userId: reporter,
        professionalId: target,
        status: 'Completed'
      });

      if (!completedBooking) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only report a professional after a service has been completed.' 
        });
      }
    }

    // Enforce "after service only" reporting for Users (customers)
    if (targetModel === 'User' && reporterModel === 'Professional') {
      const completedBooking = await Booking.findOne({
        userId: target,
        professionalId: reporter,
        status: 'Completed'
      });

      if (!completedBooking) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only report a customer after a service has been completed.' 
        });
      }
    }

    const newReport = new Report({
      reporter,
      reporterModel,
      target,
      targetModel,
      reason,
      description
    });

    await newReport.save();

    // Increment totalReports count for professional
    if (targetModel === 'Professional') {
      const ProfessionalModel = (await import('../models/professionalModel.js')).default;
      await ProfessionalModel.findByIdAndUpdate(target, { $inc: { totalReports: 1 } });
    }

    res.status(201).json({ 
      success: true,
      message: 'Report submitted successfully. Admin will review it.', 
      report: newReport 
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while submitting report' 
    });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter')
      .populate('target')
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      { 
        status, 
        adminNotes,
        resolvedAt: status !== 'Pending' ? new Date() : undefined
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ message: `Report marked as ${status}`, report });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error while updating report' });
  }
};

/**
 * Check if a reporter has already reported a target
 * GET /api/reports/check/:reporterId/:targetId
 */
export const checkExistingReport = async (req, res) => {
  try {
    const { reporterId, targetId } = req.params;
    const { reporterModel, targetModel } = req.query;

    if (!reporterModel || !targetModel) {
      return res.status(400).json({ 
        success: false,
        message: 'reporterModel and targetModel query parameters are required' 
      });
    }

    const existingReport = await Report.findOne({
      reporter: reporterId,
      reporterModel,
      target: targetId,
      targetModel
    });

    res.status(200).json({ 
      success: true,
      hasReported: !!existingReport,
      report: existingReport || null
    });
  } catch (error) {
    console.error('Check existing report error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while checking report status' 
    });
  }
};
