import User from "../models/userModel.js";
import Professional from "../models/professionalModel.js";

/**
 * Update user or professional location
 * PUT /api/users/update-location
 */
export const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, role, formattedAddress } = req.body;
        const userId = req.user.id;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        // Basic validation
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ message: "Invalid coordinates" });
        }

        const locationData = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)] // [lng, lat]
        };

        const updateData = {
            location: locationData,
            address: formattedAddress,
            formattedAddress: formattedAddress
        };

        // ALWAYS update the main User record regardless of role
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        // SYNC: If user is also a professional, update professional record
        const updatedPro = await Professional.findOneAndUpdate(
            { userId: userId },
            { 
                location: locationData,
                serviceArea: formattedAddress,
                formattedAddress: formattedAddress 
            },
            { new: true }
        );

        const primaryDoc = updatedUser || updatedPro;

        if (!primaryDoc) {
            return res.status(404).json({ message: "User or Professional not found" });
        }

        res.json({
            message: "Location updated successfully",
            location: updatedUser.location,
            formattedAddress: updatedUser.formattedAddress
        });
    } catch (err) {
        console.error("Update location error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Find nearby professionals within 5km
 * GET /api/users/nearby-professionals
 */
export const getNearbyProfessionals = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user || !user.location || !user.location.coordinates) {
            return res.status(400).json({ message: "User location not set" });
        }

        const professionals = await Professional.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: user.location.coordinates
                    },
                    $maxDistance: 5000 // 5km in meters
                }
            },
            verificationStatus: "verified",
            isActive: true
        });

        res.json({
            count: professionals.length,
            professionals
        });
    } catch (err) {
        console.error("Get nearby professionals error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Placeholder for reverse geocoding
 */
export const reverseGeocode = async (lat, lng) => {
    // In a real app, you'd call Google Maps API or OpenStreetMap
    // return `Address for ${lat}, ${lng}`;
    return "Current Location";
};
