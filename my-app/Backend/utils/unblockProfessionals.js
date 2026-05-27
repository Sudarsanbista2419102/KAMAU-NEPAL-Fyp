import ProfessionalModel from '../models/professionalModel.js';

/**
 * Auto-unblock professionals whose block period has expired
 * This function should be called before any professional listing or profile fetch
 */
export const autoUnblockExpiredProfessionals = async () => {
  try {
    const result = await ProfessionalModel.updateMany(
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

    if (result.modifiedCount > 0) {
      console.log(`🔓 Auto-unblocked ${result.modifiedCount} professionals whose block period expired`);
    }

    return result.modifiedCount;
  } catch (error) {
    console.error('Error auto-unblocking professionals:', error);
    return 0;
  }
};

/**
 * Get query filter to exclude currently blocked professionals
 * Use this in professional listing queries
 */
export const getUnblockedProfessionalsFilter = () => {
  return {
    $or: [
      { isBlocked: false },
      { isBlocked: { $exists: false } },
      { 
        isBlocked: true,
        blockedUntil: { $lte: new Date() }
      }
    ]
  };
};

/**
 * Check if a professional is currently blocked
 * @param {Object} professional - Professional document
 * @returns {Boolean} - True if blocked, false if not blocked
 */
export const isProfessionalBlocked = (professional) => {
  if (!professional.isBlocked) return false;
  if (!professional.blockedUntil) return true; // Permanently blocked
  return new Date(professional.blockedUntil) > new Date();
};

/**
 * Get blocking status message for a professional
 * @param {Object} professional - Professional document
 * @returns {String|null} - Blocking message or null if not blocked
 */
export const getBlockingMessage = (professional) => {
  if (!isProfessionalBlocked(professional)) return null;
  
  if (!professional.blockedUntil) {
    return 'This professional is currently suspended';
  }
  
  const unlockDate = new Date(professional.blockedUntil).toLocaleDateString();
  return `This professional is temporarily suspended until ${unlockDate}`;
};