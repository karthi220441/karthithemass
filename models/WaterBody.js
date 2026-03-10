const mongoose = require("mongoose");

/**
 * WaterBody Schema
 * Represents protected water bodies with GeoJSON polygon boundaries
 * Used for geospatial intersection queries to validate complaint locations
 */
const waterBodySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        default: ""
    },
    district: {
        type: String,
        required: true,
        index: true
    },
    state: {
        type: String,
        default: "Tamil Nadu"
    },
    /**
     * GeoJSON Polygon for geospatial queries
     * Format: {
     *   type: "Polygon",
     *   coordinates: [[[lng1, lat1], [lng2, lat2], ..., [lng1, lat1]]]
     * }
     * Note: Coordinates must be [longitude, latitude] format
     * The polygon must be closed (first and last coordinates must match)
     */
    location: {
        type: {
            type: String,
            enum: ['Polygon'],
            required: true
        },
        coordinates: {
            type: [[[Number]]],
            required: true
        }
    },
    /**
     * Alternative: Store polygon as GeoJSON Feature
     * This enables MongoDB's geospatial query operators
     */
    geometry: {
        type: {
            type: String,
            enum: ['Polygon'],
            default: 'Polygon'
        },
        coordinates: [[[Number]]]
    },
    area: {
        type: Number,  // Area in square kilometers
        default: 0
    },
    protectionLevel: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
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

// Create geospatial index on location field for efficient geospatial queries
waterBodySchema.index({ 'location': '2dsphere' });
waterBodySchema.index({ 'geometry': '2dsphere' });

module.exports = mongoose.model("WaterBody", waterBodySchema);
