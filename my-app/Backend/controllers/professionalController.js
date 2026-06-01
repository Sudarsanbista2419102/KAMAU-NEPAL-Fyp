import ProfessionalModel from '../models/professionalModel.js';
import NotificationModel from '../models/notificationModel.js';
import fs from 'fs';
import path from 'path';
import { createNotification } from './notificationController.js';
import sharp from 'sharp';

// Register a new professional service provider
export const registerProfessional = async (req, res) => {
  try {
    console.log('=== Professional Registration Started ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');

    const {
      firstName,
      lastName,
      username,
      email,
      phone,
      gender,
      serviceCategory,
      serviceArea,
      hourlyWage,
      bio,
      latitude,
      longitude,
      formattedAddress,
      jobType,
      availability,
      tools,
      userId: bodyUserId
    } = req.body;

    // Use userId from authenticated user if available, otherwise from body
    const userId = req.user?.id || bodyUserId;

    const isFreelancerType = ['freelancer', 'graphic_designer', 'logo_designer', 'developer'].includes(serviceCategory);
    
    // Validate required fields
    if (!firstName || !lastName || !username || !email || !phone || !serviceCategory || (!isFreelancerType && !serviceArea)) {
      console.log('❌ Missing required fields');
      console.log('Received:', { firstName, lastName, username, email, phone, serviceCategory, serviceArea });
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
        received: { firstName, lastName, username, email, phone, serviceCategory, serviceArea, hourlyWage }
      });
    }

    // Validate hourly wage
    if (hourlyWage) {
      const wage = parseFloat(hourlyWage);
      if (wage < 100) {
        console.log('❌ Hourly wage below minimum:', wage);
        return res.status(400).json({
          success: false,
          message: 'Hourly wage must be at least रु 100'
        });
      }
    }

    // Check if user already has a professional profile
    if (userId) {
      const existingProfile = await ProfessionalModel.findOne({ userId });
      if (existingProfile) {
        if (existingProfile.verificationStatus === 'rejected') {
          console.log('♻️  Removing previous rejected profile for user:', userId);
          await ProfessionalModel.deleteOne({ _id: existingProfile._id });
        } else {
          console.log('❌ User already has a professional profile:', userId);
          return res.status(409).json({
            success: false,
            message: 'You have already registered as a professional',
            verificationStatus: existingProfile.verificationStatus
          });
        }
      }
    }

    // Check if email already exists
    const existingEmail = await ProfessionalModel.findOne({ email });
    if (existingEmail) {
      if (existingEmail.verificationStatus === 'rejected') {
        console.log('♻️  Removing previous rejected profile with email:', email);
        await ProfessionalModel.deleteOne({ _id: existingEmail._id });
      } else {
        console.log('❌ Email already exists:', email);
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // Check if username already exists
    const existingUsername = await ProfessionalModel.findOne({ username });
    if (existingUsername) {
      if (existingUsername.verificationStatus === 'rejected') {
        console.log('♻️  Removing previous rejected profile with username:', username);
        await ProfessionalModel.deleteOne({ _id: existingUsername._id });
      } else {
        console.log('❌ Username already exists:', username);
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Handle profile image
    let profileImagePath = null;
    if (req.files && req.files.profileImage) {
      const originalPath = req.files.profileImage[0].path;
      const optimizedName = `opt-profile-${req.files.profileImage[0].filename.split('.')[0]}.webp`;
      const optimizedPath = path.join(path.dirname(originalPath), optimizedName);
      
      try {
        await sharp(originalPath)
          .resize(500, 500, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(optimizedPath);
        
        fs.unlinkSync(originalPath);
        profileImagePath = optimizedPath.replace(/\\/g, '/');
      } catch (sharpError) {
        profileImagePath = originalPath.replace(/\\/g, '/');
      }
    }

    // Handle cover image
    let coverImagePath = null;
    if (req.files && req.files.coverImage) {
      const originalPath = req.files.coverImage[0].path;
      const optimizedName = `opt-cover-${req.files.coverImage[0].filename.split('.')[0]}.webp`;
      const optimizedPath = path.join(path.dirname(originalPath), optimizedName);
      
      try {
        await sharp(originalPath)
          .resize(1200, 600, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(optimizedPath);
        
        fs.unlinkSync(originalPath);
        coverImagePath = optimizedPath.replace(/\\/g, '/');
        console.log('✅ Cover image optimized:', coverImagePath);
      } catch (sharpError) {
        console.error('⚠️ Cover optimization failed:', sharpError);
        coverImagePath = originalPath.replace(/\\/g, '/');
      }
    }

    // Handle verification documents
    let documentPaths = [];
    if (req.files && req.files.documents && req.files.documents.length > 0) {
      documentPaths = req.files.documents.map(doc => ({
        filename: doc.filename,
        path: doc.path,
        originalName: doc.originalname,
        mimetype: doc.mimetype,
        size: doc.size
      }));
      console.log('✅ Documents uploaded:', documentPaths.length);
    } else {
      console.log('⚠️  No documents uploaded');
      return res.status(400).json({
        success: false,
        message: 'At least one verification document is required'
      });
    }

    // Create new professional record
    const newProfessional = new ProfessionalModel({
      firstName,
      lastName,
      username,
      email,
      phone,
      gender,
      serviceCategory,
      serviceArea,
      hourlyWage: parseFloat(hourlyWage) || 0,
      bio: bio || '',
      userId: userId || null,
      profileImage: profileImagePath,
      coverImage: coverImagePath,
      verificationDocuments: documentPaths,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0]
      },
      formattedAddress: formattedAddress || serviceArea,
      jobType: jobType || 'full-time',
      availability: (() => {
        try {
          return typeof availability === 'string' ? JSON.parse(availability) : (Array.isArray(availability) ? availability : []);
        } catch (e) { return []; }
      })(),
      tools: (() => {
        try {
          const parsed = typeof tools === 'string' ? JSON.parse(tools) : tools;
          return Array.isArray(parsed) ? [...new Set(parsed)] : [];
        } catch (e) { return []; }
      })(),
      skills: (() => {
        try {
          const skillsData = req.body.skills;
          const parsed = typeof skillsData === 'string' ? JSON.parse(skillsData) : skillsData;
          return Array.isArray(parsed) ? [...new Set(parsed)] : [];
        } catch (e) { return []; }
      })(),
      verificationStatus: 'pending',
      isVerified: false,
      isActive: true,
      createdAt: new Date()
    });

    console.log('💾 Professional object created:', {
      firstName: newProfessional.firstName,
      lastName: newProfessional.lastName,
      email: newProfessional.email,
      username: newProfessional.username,
      serviceCategory: newProfessional.serviceCategory,
      serviceArea: newProfessional.serviceArea,
      hourlyWage: newProfessional.hourlyWage,
      docsCount: newProfessional.verificationDocuments.length
    });

    // Save to database
    const savedProfessional = await newProfessional.save();
    console.log('✅ Professional saved successfully to database:', savedProfessional._id);

    return res.status(201).json({
      success: true,
      message: 'Professional registration completed successfully!',
      data: {
        id: savedProfessional._id,
        username: savedProfessional.username,
        email: savedProfessional.email,
        verificationStatus: savedProfessional.verificationStatus
      }
    });

  } catch (error) {
    console.error('❌ Professional registration error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
};

// Get professional profile by ID
export const getProfessionalProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Auto-unblock professionals whose block period has expired
    await ProfessionalModel.updateMany(
      {
        isBlocked: true,
        blockedUntil: { $lte: new Date() }
      },
      {
        $set: {
          isBlocked: false,
          blockedUntil: null
        }
      }
    );

    const professional = await ProfessionalModel.findOne({
      _id: id
    }).select('-verificationDocuments');

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found'
      });
    }

    // Check if professional is currently blocked
    if (professional.isBlocked && professional.blockedUntil && new Date(professional.blockedUntil) > new Date()) {
      return res.status(403).json({
        success: false,
        message: 'This professional is temporarily unavailable',
        isBlocked: true,
        blockedUntil: professional.blockedUntil
      });
    }

    return res.status(200).json({
      success: true,
      data: professional
    });

  } catch (error) {
    console.error('Error fetching professional profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Get all professionals (with pagination)
export const getAllProfessionals = async (req, res) => {
  try {
    const { page = 1, limit = 10, serviceCategory, serviceArea, verificationStatus = 'verified' } = req.query;

    // Auto-unblock professionals whose block period has expired
    await ProfessionalModel.updateMany(
      {
        isBlocked: true,
        blockedUntil: { $lte: new Date() }
      },
      {
        $set: {
          isBlocked: false,
          blockedUntil: null
        }
      }
    );

    const query = { 
      isVerified: true,
      $or: [
        { isBlocked: false },
        { isBlocked: { $exists: false } },
        { 
          isBlocked: true,
          blockedUntil: { $lte: new Date() }
        }
      ]
    };

    if (serviceCategory) {
      query.serviceCategory = serviceCategory;
    }

    if (serviceArea) {
      query.serviceArea = serviceArea;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const professionals = await ProfessionalModel.find(query)
      .select('-verificationDocuments')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ProfessionalModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: professionals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching professionals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch professionals',
      error: error.message
    });
  }
};

// Search professionals by category and area
export const searchProfessionals = async (req, res) => {
  try {
    const { serviceCategory, serviceArea } = req.query;

    // Auto-unblock professionals whose block period has expired
    await ProfessionalModel.updateMany(
      {
        isBlocked: true,
        blockedUntil: { $lte: new Date() }
      },
      {
        $set: {
          isBlocked: false,
          blockedUntil: null
        }
      }
    );

    const query = { 
      isVerified: true,
      $or: [
        { isBlocked: false },
        { isBlocked: { $exists: false } },
        { 
          isBlocked: true,
          blockedUntil: { $lte: new Date() }
        }
      ]
    };

    if (serviceCategory) {
      query.serviceCategory = serviceCategory;
    }

    if (serviceArea) {
      query.serviceArea = serviceArea;
    }

    const professionals = await ProfessionalModel.find(query)
      .select('-verificationDocuments')
      .sort({ rating: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: professionals
    });

  } catch (error) {
    console.error('Error searching professionals:', error);
    return res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// Update professional profile
export const updateProfessionalProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, bio, hourlyWage, serviceArea, phone, gender, formattedAddress, availability } = req.body;

    // Validate hourly wage if provided
    if (hourlyWage !== undefined) {
      const wage = parseFloat(hourlyWage);
      if (wage < 100) {
        console.log('❌ Hourly wage below minimum:', wage);
        return res.status(400).json({
          success: false,
          message: 'Hourly wage must be at least रु 100'
        });
      }
    }

    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (hourlyWage !== undefined) updateData.hourlyWage = parseFloat(hourlyWage);
    if (serviceArea) updateData.serviceArea = serviceArea;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (formattedAddress) updateData.formattedAddress = formattedAddress;
    if (availability) {
      updateData.availability = typeof availability === 'string' ? JSON.parse(availability) : availability;
    }
    if (req.body.tools) {
      updateData.tools = typeof req.body.tools === 'string' ? [...new Set(JSON.parse(req.body.tools))] : (Array.isArray(req.body.tools) ? [...new Set(req.body.tools)] : []);
    }
    if (req.body.skills) {
      updateData.skills = typeof req.body.skills === 'string' ? [...new Set(JSON.parse(req.body.skills))] : (Array.isArray(req.body.skills) ? [...new Set(req.body.skills)] : []);
    }

    // Handle profile image update
    if (req.files && req.files.profileImage) {
      const originalPath = req.files.profileImage[0].path;
      const optimizedName = `opt-profile-${req.files.profileImage[0].filename.split('.')[0]}.webp`;
      const optimizedPath = path.join(path.dirname(originalPath), optimizedName);
      
      try {
        await sharp(originalPath)
          .resize(500, 500, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(optimizedPath);
        
        fs.unlinkSync(originalPath);
        updateData.profileImage = optimizedPath.replace(/\\/g, '/');
      } catch (err) {
        updateData.profileImage = originalPath.replace(/\\/g, '/');
      }
    }

    // Handle cover image update
    if (req.files && req.files.coverImage) {
      const originalPath = req.files.coverImage[0].path;
      const optimizedName = `opt-cover-${req.files.coverImage[0].filename.split('.')[0]}.webp`;
      const optimizedPath = path.join(path.dirname(originalPath), optimizedName);
      
      try {
        await sharp(originalPath)
          .resize(1200, 600, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(optimizedPath);
        
        fs.unlinkSync(originalPath);
        updateData.coverImage = optimizedPath.replace(/\\/g, '/');
      } catch (err) {
        updateData.coverImage = originalPath.replace(/\\/g, '/');
      }
    }

    const updatedProfessional = await ProfessionalModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-verificationDocuments');

    if (!updatedProfessional) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found'
      });
    }

    // SYNC: Also update linked User profile if it has userId
    if (updatedProfessional.userId) {
      try {
        const { default: User } = await import('../models/userModel.js');
        const userUpdate = {};
        if (firstName || lastName) {
          userUpdate.name = `${firstName || updatedProfessional.firstName} ${lastName || updatedProfessional.lastName}`.trim();
        }
        if (phone) userUpdate.phone = phone;
        if (formattedAddress || serviceArea) {
          userUpdate.address = formattedAddress || serviceArea;
          userUpdate.formattedAddress = formattedAddress || serviceArea;
        }
        
        await User.findByIdAndUpdate(updatedProfessional.userId, { $set: userUpdate });
        console.log("Synchronized User profile from Professional update for userId:", updatedProfessional.userId);
      } catch (err) {
        console.error('Failed to sync User from Professional update:', err);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfessional
    });

  } catch (error) {
    console.error('Error updating professional profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get pending professional applications (Admin)
export const getPendingApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await ProfessionalModel.find({ verificationStatus: 'pending' })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ProfessionalModel.countDocuments({ verificationStatus: 'pending' });

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching pending applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Verify professional (Admin)
export const verifyProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // status: 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const updateData = {
      verificationStatus: status,
      verificationDate: new Date()
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const professional = await ProfessionalModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    // Create notification for the user
    if (professional.userId) {
      const title = status === 'verified' ? 'Application Approved!' : 'Application Rejected';
      const description = status === 'verified' 
        ? 'Your professional profile has been verified. You can now receive job requests.'
        : `Your professional profile application was rejected. Reason: ${rejectionReason || 'No reason provided.'}`;
      const type = status === 'verified' ? 'update' : 'request';
      
      await createNotification(professional.userId, type, title, description, '/dashboard');
    }

    return res.status(200).json({
      success: true,
      message: `Professional ${status} successfully`,
      data: professional
    });

  } catch (error) {
    console.error('Error verifying professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};

// Delete professional profile (Admin or user)
export const deleteProfessionalProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await ProfessionalModel.findByIdAndDelete(id);

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found'
      });
    }

    // Delete associated files from storage
    try {
      if (professional.profileImage && !professional.profileImage.startsWith('data:')) {
        const imagePath = path.join(path.resolve(), professional.profileImage);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Deleted profile image:', imagePath);
        }
      }
      
      if (professional.verificationDocuments && professional.verificationDocuments.length > 0) {
        professional.verificationDocuments.forEach(doc => {
          if (doc.path) {
            const docPath = path.join(path.resolve(), doc.path);
            if (fs.existsSync(docPath)) {
              fs.unlinkSync(docPath);
              console.log('Deleted document:', docPath);
            }
          }
        });
      }
    } catch (fileErr) {
      console.error('Error deleting files:', fileErr);
      // Don't fail the deletion if file cleanup fails
    }

    return res.status(200).json({
      success: true,
      message: 'Professional profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting professional profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete profile',
      error: error.message
    });
  }
};

// Get professional by username
export const getProfessionalByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    // Auto-unblock professionals whose block period has expired
    await ProfessionalModel.updateMany(
      {
        isBlocked: true,
        blockedUntil: { $lte: new Date() }
      },
      {
        $set: {
          isBlocked: false,
          blockedUntil: null
        }
      }
    );

    const professional = await ProfessionalModel.findOne({
      username,
      isVerified: true
    }).select('-verificationDocuments');

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found'
      });
    }

    // Check if professional is currently blocked
    if (professional.isBlocked && professional.blockedUntil && new Date(professional.blockedUntil) > new Date()) {
      return res.status(403).json({
        success: false,
        message: 'This professional is temporarily unavailable',
        isBlocked: true,
        blockedUntil: professional.blockedUntil
      });
    }

    return res.status(200).json({
      success: true,
      data: professional
    });

  } catch (error) {
    console.error('Error fetching professional:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch professional',
      error: error.message
    });
  }
};

// Get current user's professional profile
export const getMyProfessionalProfile = async (req, res) => {
  try {
    const { email, id } = req.user;

    const professional = await ProfessionalModel.findOne({
      $or: [{ email }, { userId: id }]
    }).select('-verificationDocuments');

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'No professional profile found for this user'
      });
    }

    return res.status(200).json({
      success: true,
      data: professional
    });

  } catch (error) {
    console.error('Error fetching my professional profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch professional profile',
      error: error.message
    });
  }
};
// Get all unique service categories
export const getServiceCategories = async (req, res) => {
  try {
    const categories = await ProfessionalModel.distinct('serviceCategory', { isVerified: true });
    
    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get all unique service areas
export const getServiceAreas = async (req, res) => {
  try {
    const areas = await ProfessionalModel.distinct('serviceArea', { 
      isVerified: true,
      serviceArea: { $ne: null } 
    });
    
    return res.status(200).json({
      success: true,
      data: areas.filter(area => area && area.trim() !== "")
    });
  } catch (error) {
    console.error('Error fetching areas:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch areas',
      error: error.message
    });
  }
};
