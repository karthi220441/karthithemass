const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    district: {
        type: String
    },
    location: {
        type: String
    },
    latitude: {
        type: Number,
        required: false
    },
    longitude: {
        type: Number,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    image: {
        type: String
    },
    status: {
        type: String,
        default: "Pending"
    },
    // AI Image Verification Fields
    aiDetectionLabel: {
        type: [String],
        default: []
    },
    aiConfidenceScore: {
        type: Number,
        min: 0,
        max: 1,
        default: null
    },
    // Geospatial Boundary Detection Fields
    verifiedLocation: {
        type: Boolean,
        default: false
    },
    waterBodyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WaterBody',
        default: null
    },
    // Crowd Verification Fields
    crowdVerified: {
        type: Boolean,
        default: false
    },
    verificationVotes: [{
        voterId: String,        // Anonymous voter ID (IP hash + device fingerprint)
        voteType: {
            type: String,
            enum: ['confirm', 'reject']
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    confirmedCount: {
        type: Number,
        default: 0
    },
    rejectedCount: {
        type: Number,
        default: 0
    },
    credibilityScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0
    },
    // Satellite Change Detection Fields
    satelliteAlert: {
        type: Boolean,
        default: false
    },
    satelliteCheckHistory: [{
        checkDate: Date,
        changeDetected: Boolean,
        changePercentage: Number,
        alertMessage: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Complaint", complaintSchema);