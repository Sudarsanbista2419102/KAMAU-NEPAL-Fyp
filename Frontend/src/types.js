// Type definitions for TypeScript/JSDoc
/**
 * @typedef {Object} DashboardStats
 * @property {number} totalApplications
 * @property {number} totalPending
 * @property {number} totalApproved
 * @property {number} totalRejected
 */

/**
 * @typedef {Object} Professional
 * @property {string} _id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} username
 * @property {string} email
 * @property {string} phone
 * @property {string} serviceCategory
 * @property {string} serviceArea
 * @property {number} hourlyWage
 * @property {string} bio
 * @property {string} profileImage
 * @property {Array} verificationDocuments
 * @property {string} verificationStatus
 * @property {number} rating
 * @property {number} completedJobs
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} RegistrationStatus
 * @property {string} status - pending, verified, approved, rejected
 * @property {string} message
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} ServiceRecord
 * @property {string} id
 * @property {string} title
 * @property {string} company
 * @property {string} provider
 * @property {number} rating
 * @property {string} category
 * @property {string} date
 * @property {string} dateAdded
 * @property {number} cost
 */

export {};
