const Complaint = require("../models/Complaint");

// Create complaint
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
        
        const complaint = new Complaint(complaintData);
        await complaint.save();
        
        const io = req.app.get('io');
        io.emit('newComplaint', complaint.toObject());
        
        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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