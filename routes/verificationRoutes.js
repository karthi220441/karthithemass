const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

/**
 * Crowd Verification Routes
 * All routes for user-based verification and credibility scoring
 */

/**
 * POST /api/complaints/:id/verify
 * Submit a confirmation vote for a complaint
 * 
 * Request body:
 * {
 *   voterId: string (anonymous ID from device fingerprint + IP hash)
 * }
 * 
 * Response: Updated complaint with credibility score
 */
router.post("/:id/verify", async (req, res) => {
    try {
        const { id } = req.params;
        const { voterId } = req.body;

        if (!voterId) {
            return res.status(400).json({
                success: false,
                message: "voterId is required",
                code: "MISSING_VOTER_ID"
            });
        }

        // Find complaint by ID
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({
                
                success: false,
                message: "Complaint not found",
                code: "COMPLAINT_NOT_FOUND"
            });
        }

        // Check if voter already voted
        const existingVote = complaint.verificationVotes.find(v => v.voterId === voterId);
        if (existingVote) {
            return res.status(400).json({
                success: false,
                message: "You have already voted for this complaint",
                code: "DUPLICATE_VOTE",
                currentVote: existingVote.voteType
            });
        }

        // Add confirmation vote
        complaint.verificationVotes.push({
            voterId,
            voteType: 'confirm',
            timestamp: new Date()
        });

        // Recalculate counts
        complaint.confirmedCount = complaint.verificationVotes.filter(v => v.voteType === 'confirm').length;
        complaint.rejectedCount = complaint.verificationVotes.filter(v => v.voteType === 'reject').length;

        // Calculate credibility score
        const totalVotes = complaint.verificationVotes.length;
        complaint.credibilityScore = totalVotes > 0 
            ? (complaint.confirmedCount / totalVotes)
            : 0;

        // Mark as crowd verified if score exceeds threshold (0.7)
        if (complaint.credibilityScore >= 0.7) {
            complaint.crowdVerified = true;
        }

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Verification vote recorded successfully",
            complaint: {
                id: complaint._id,
                confirmedCount: complaint.confirmedCount,
                rejectedCount: complaint.rejectedCount,
                totalVotes,
                credibilityScore: parseFloat(complaint.credibilityScore.toFixed(3)),
                crowdVerified: complaint.crowdVerified
            }
        });

    } catch (error) {
        console.error("[Verification Route] Error in verify endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            code: "SERVER_ERROR",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * POST /api/complaints/:id/reject
 * Submit a rejection vote for a complaint
 * 
 * Request body:
 * {
 *   voterId: string (anonymous ID from device fingerprint + IP hash),
 *   reason?: string (optional reason for rejection)
 * }
 * 
 * Response: Updated complaint with credibility score
 */
router.post("/:id/reject", async (req, res) => {
    try {
        const { id } = req.params;
        const { voterId, reason } = req.body;

        if (!voterId) {
            return res.status(400).json({
                success: false,
                message: "voterId is required",
                code: "MISSING_VOTER_ID"
            });
        }

        // Find complaint by ID
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
                code: "COMPLAINT_NOT_FOUND"
            });
        }

        // Check if voter already voted
        const existingVote = complaint.verificationVotes.find(v => v.voterId === voterId);
        if (existingVote) {
            return res.status(400).json({
                success: false,
                message: "You have already voted for this complaint",
                code: "DUPLICATE_VOTE",
                currentVote: existingVote.voteType
            });
        }

        // Add rejection vote
        complaint.verificationVotes.push({
            voterId,
            voteType: 'reject',
            timestamp: new Date()
        });

        // Recalculate counts
        complaint.confirmedCount = complaint.verificationVotes.filter(v => v.voteType === 'confirm').length;
        complaint.rejectedCount = complaint.verificationVotes.filter(v => v.voteType === 'reject').length;

        // Calculate credibility score
        const totalVotes = complaint.verificationVotes.length;
        complaint.credibilityScore = totalVotes > 0 
            ? (complaint.confirmedCount / totalVotes)
            : 0;

        // Mark as not crowd verified if score drops below threshold
        if (complaint.credibilityScore < 0.7) {
            complaint.crowdVerified = false;
        }

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: "Rejection vote recorded successfully",
            complaint: {
                id: complaint._id,
                confirmedCount: complaint.confirmedCount,
                rejectedCount: complaint.rejectedCount,
                totalVotes,
                credibilityScore: parseFloat(complaint.credibilityScore.toFixed(3)),
                crowdVerified: complaint.crowdVerified,
                reason: reason || null
            }
        });

    } catch (error) {
        console.error("[Verification Route] Error in reject endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            code: "SERVER_ERROR",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/complaints/:id/credibility
 * Get detailed credibility information for a complaint
 * 
 * Response: Detailed credibility metrics and voting breakdown
 */
router.get("/:id/credibility", async (req, res) => {
    try {
        const { id } = req.params;

        // Find complaint by ID
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
                code: "COMPLAINT_NOT_FOUND"
            });
        }

        const totalVotes = complaint.verificationVotes.length;
        const votingBreakdown = {
            confirmed: complaint.confirmedCount,
            rejected: complaint.rejectedCount,
            total: totalVotes
        };

        // Calculate voting percentages
        const votingPercentages = {
            confirmedPercentage: totalVotes > 0 ? parseFloat(((complaint.confirmedCount / totalVotes) * 100).toFixed(1)) : 0,
            rejectedPercentage: totalVotes > 0 ? parseFloat(((complaint.rejectedCount / totalVotes) * 100).toFixed(1)) : 0
        };

        // Get recent votes for timeline
        const recentVotes = complaint.verificationVotes
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10)
            .map(v => ({
                voteType: v.voteType,
                timestamp: v.timestamp,
                relativeTime: getRelativeTime(v.timestamp)
            }));

        // Determine credibility status
        let credibilityStatus;
        if (complaint.credibilityScore >= 0.7) {
            credibilityStatus = 'VERIFIED';
        } else if (complaint.credibilityScore >= 0.4) {
            credibilityStatus = 'PARTIALLY_VERIFIED';
        } else if (totalVotes > 0) {
            credibilityStatus = 'NOT_VERIFIED';
        } else {
            credibilityStatus = 'NO_VOTES';
        }

        return res.status(200).json({
            success: true,
            credibility: {
                complaintId: complaint._id,
                credibilityScore: parseFloat(complaint.credibilityScore.toFixed(3)),
                credibilityStatus,
                crowdVerified: complaint.crowdVerified,
                votingBreakdown,
                votingPercentages,
                recentVotes,
                votingTrend: calculateVotingTrend(complaint.verificationVotes),
                recommendations: generateCredibilityRecommendations(complaint)
            }
        });

    } catch (error) {
        console.error("[Verification Route] Error in credibility endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            code: "SERVER_ERROR",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/complaints/:id/verification-details
 * Get complete verification details including AI analysis and geolocation
 */
router.get("/:id/verification-details", async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findById(id).populate('waterBodyId');
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        return res.status(200).json({
            success: true,
            verificationDetails: {
                complaintId: complaint._id,
                aiVerification: {
                    detectionLabels: complaint.aiDetectionLabel,
                    confidenceScore: complaint.aiConfidenceScore,
                    detected: complaint.aiDetectionLabel.length > 0
                },
                geolocationVerification: {
                    verified: complaint.verifiedLocation,
                    withinWaterBody: complaint.waterBodyId ? true : false,
                    waterBodyName: complaint.waterBodyId?.name || null,
                    coordinates: {
                        latitude: complaint.latitude,
                        longitude: complaint.longitude
                    }
                },
                crowdVerification: {
                    crowdVerified: complaint.crowdVerified,
                    credibilityScore: parseFloat(complaint.credibilityScore.toFixed(3)),
                    totalVotes: complaint.verificationVotes.length,
                    confirmedVotes: complaint.confirmedCount,
                    rejectedVotes: complaint.rejectedCount
                },
                satelliteMonitoring: {
                    alertActive: complaint.satelliteAlert,
                    checksPerformed: complaint.satelliteCheckHistory.length,
                    lastCheck: complaint.satelliteCheckHistory.length > 0 
                        ? complaint.satelliteCheckHistory[complaint.satelliteCheckHistory.length - 1].checkDate
                        : null
                },
                overallVerificationScore: calculateOverallVerificationScore(complaint)
            }
        });

    } catch (error) {
        console.error("[Verification Route] Error in verification-details endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Helper function: Calculate voting trend
 */
function calculateVotingTrend(votes) {
    if (votes.length < 2) return 'neutral';

    const lastHalf = votes.slice(Math.floor(votes.length / 2));
    const confirmRate = lastHalf.filter(v => v.voteType === 'confirm').length / lastHalf.length;

    if (confirmRate >= 0.7) return 'improving';
    if (confirmRate <= 0.3) return 'declining';
    return 'neutral';
}

/**
 * Helper function: Generate credibility recommendations
 */
function generateCredibilityRecommendations(complaint) {
    const recommendations = [];

    if (complaint.verificationVotes.length === 0) {
        recommendations.push("No community votes yet. Share this complaint to get public verification.");
    } else if (complaint.credibilityScore >= 0.7) {
        recommendations.push("This complaint has strong community support. Consider it for priority action.");
    } else if (complaint.credibilityScore >= 0.4) {
        recommendations.push("This complaint has mixed community feedback. Recommend ground verification.");
    } else {
        recommendations.push("This complaint lacks community support. Re-investigate or close if not verified.");
    }

    if (complaint.aiConfidenceScore && complaint.aiConfidenceScore >= 0.8) {
        recommendations.push("AI analysis confirms environmental hazard with high confidence.");
    }

    if (complaint.verifiedLocation) {
        recommendations.push("Location verified within protected water body boundary.");
    }

    return recommendations;
}

/**
 * Helper function: Get relative time string
 */
function getRelativeTime(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Helper function: Calculate overall verification score
 * Combines AI, geolocation, crowd, and satellite verification
 */
function calculateOverallVerificationScore(complaint) {
    let score = 0;
    let weights = 0;

    // AI verification: 25%
    if (complaint.aiConfidenceScore !== null) {
        score += complaint.aiConfidenceScore * 0.25;
        weights += 0.25;
    }

    // Geolocation: 25%
    if (complaint.verifiedLocation) {
        score += 1 * 0.25;
        weights += 0.25;
    }

    // Crowd verification: 30%
    if (complaint.verificationVotes.length > 0) {
        score += complaint.credibilityScore * 0.30;
        weights += 0.30;
    }

    // Satellite monitoring: 20%
    if (complaint.satelliteAlert) {
        score += 1 * 0.20;
        weights += 0.20;
    }

    return weights > 0 ? parseFloat((score / weights).toFixed(3)) : 0;
}

module.exports = router;
