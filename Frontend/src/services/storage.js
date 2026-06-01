/**
 * Service History Storage Management
 * Handles storing and retrieving service history from localStorage
 */

const STORAGE_KEY = 'servicesTaken';

/**
 * Get all taken services from localStorage
 * @returns {Array} Array of service records
 */
export const getTakenServices = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving services:', error);
    return [];
  }
};

/**
 * Add a service to the taken services list
 * @param {Object} service - Service object with title, company, rating, etc.
 */
export const addTakenService = (service) => {
  try {
    const services = getTakenServices();
    const newService = {
      id: Date.now().toString(),
      ...service,
      dateAdded: new Date().toISOString(),
      category: service.serviceCategory || 'General'
    };
    services.push(newService);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    return newService;
  } catch (error) {
    console.error('Error adding service:', error);
  }
};

/**
 * Remove a service from history
 * @param {string} serviceId - ID of the service to remove
 */
export const removeTakenService = (serviceId) => {
  try {
    const services = getTakenServices();
    const filtered = services.filter(s => s.id !== serviceId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing service:', error);
    return false;
  }
};

/**
 * Clear all service history
 */
export const clearServicesHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

/**
 * Get service statistics
 * @returns {Object} Statistics of services
 */
export const getServicesStats = () => {
  const services = getTakenServices();
  if (services.length === 0) {
    return {
      total: 0,
      averageRating: 0,
      categories: {}
    };
  }

  const totalRating = services.reduce((sum, s) => sum + (s.rating || 0), 0);
  const categories = {};
  
  services.forEach(service => {
    const cat = service.category || 'General';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  return {
    total: services.length,
    averageRating: (totalRating / services.length).toFixed(1),
    categories
  };
};

/**
 * Get services by category
 * @param {string} category - Category name
 * @returns {Array} Filtered services
 */
export const getServicesByCategory = (category) => {
  const services = getTakenServices();
  return services.filter(s => (s.category || 'General') === category);
};
