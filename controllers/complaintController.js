const Complaint = require("../models/Complaint");
const WaterBody = require("../models/WaterBody");
const aiImageVerification = require("../services/aiImageVerification");
const path = require('path');

/**
 * Create complaint with AI verification and geospatial checks
 * Processes uploaded image through AI analysis
 * Checks if location is within protected water body boundaries
 */
exports.createComplaint = async (req, res) => {
    try {
        const complaintData = { ...req.body };
        
        // Handle location data
        if (req.body.latitude) {
            complaintData.latitude = parseFloat(req.body.latitude);
        }
        if (req.body.longitude) {
            complaintData.longitude = parseFloat(req.body.longitude);
        }
        
        if (req.file) {
            complaintData.image = req.file.filename;
        }
        
        // Create complaint document
        const complaint = new Complaint(complaintData);
        await complaint.save();
        
        const io = req.app.get('io');
        
        // Emit new complaint event
        io.emit('newComplaint', complaint.toObject());
        
        // Process AI image analysis if image is uploaded
        if (req.file) {
            processImageAnalysisAsync(complaint, io, req.file.path);
        }
        
        // Process geospatial verification if coordinates are provided
        if (complaintData.latitude && complaintData.longitude) {
            processGeospatialVerificationAsync(complaint, io);
        }
        
        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Asynchronously process image through AI verification service
 * Updates complaint with detection results
 * Does not block the response
 */
async function processImageAnalysisAsync(complaint, io, imagePath) {
    try {
        console.log(`[Complaint Controller] Starting AI analysis for complaint ${complaint._id}`);
        
        // Analyze image
        const analysisResult = await aiImageVerification.analyzeImageWithFallback(imagePath);
        
        // Update complaint with AI results
        complaint.aiDetectionLabel = analysisResult.labels;
        complaint.aiConfidenceScore = analysisResult.confidenceScore;
        
        await complaint.save();
        
        console.log(`[Complaint Controller] AI analysis complete for complaint ${complaint._id}`);
        
        // Emit AI detection event to dashboard
        io.emit('aiDetectionComplete', {
            complaintId: complaint._id,
            labels: analysisResult.labels,
            confidenceScore: analysisResult.confidenceScore,
            detections: analysisResult.detections,
            environmentalHazardDetected: analysisResult.environmentalHazardDetected
        });
        
    } catch (error) {
        console.error(`[Complaint Controller] Error in image analysis for complaint ${complaint._id}:`, error);
        io.emit('aiDetectionError', {
            complaintId: complaint._id,
            error: error.message
        });
    }
}

/**
 * Asynchronously verify complaint location against water body boundaries
 * Uses MongoDB geospatial queries
 * Does not block the response
 */
async function processGeospatialVerificationAsync(complaint, io) {
    try {
        console.log(`[Complaint Controller] Starting geospatial verification for complaint ${complaint._id}`);
        
        // Query water bodies using geospatial intersection
        const waterBodies = await WaterBody.find({
            geometry: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [complaint.longitude, complaint.latitude]
                    }
                }
            },
            status: 'active'
        });
        
        if (waterBodies.length > 0) {
            // Location is within a water body boundary
            complaint.verifiedLocation = true;
            complaint.waterBodyId = waterBodies[0]._id;
            
            console.log(`[Complaint Controller] Location verified within ${waterBodies[0].name}`);
            io.emit('locationVerified', {
                complaintId: complaint._id,
                verified: true,
                waterBodyName: waterBodies[0].name,
                coordinates: [complaint.latitude, complaint.longitude]
            });
        } else {
            // Location is outside protected water bodies
            complaint.verifiedLocation = false;
            
            console.log(`[Complaint Controller] Location NOT verified within any water body`);
            io.emit('locationVerified', {
                complaintId: complaint._id,
                verified: false,
                message: 'Complaint location is outside protected water body boundaries'
            });
        }
        
        await complaint.save();
        
    } catch (error) {
        console.error(`[Complaint Controller] Error in geospatial verification for complaint ${complaint._id}:`, error);
        io.emit('geospatialVerificationError', {
            complaintId: complaint._id,
            error: error.message
        });
    }
}

// Get all complaints
exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find();
        const complaintsWithImageUrl = complaints.map(complaint => ({
            ...complaint.toObject(),
            imageUrl: complaint.image ? `http://localhost:5000/uploads/${complaint.image}` : null
        }));
        res.json(complaintsWithImageUrl);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update complaint status
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(id, { status }, { new: true });
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        const io = req.app.get('io');
        io.emit('statusUpdate', { id, status });
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};