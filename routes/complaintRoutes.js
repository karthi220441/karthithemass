const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post("/complaints", upload.single('image'), complaintController.createComplaint);
router.get("/complaints", complaintController.getComplaints);
router.put("/complaints/:id/status", complaintController.updateStatus);

module.exports = router;