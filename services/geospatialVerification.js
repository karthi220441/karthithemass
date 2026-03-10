/**
 * Geospatial Verification Service
 * Handles location-based verification against water body boundaries
 * Uses MongoDB geospatial queries for efficient boundary checking
 */

const WaterBody = require('../models/WaterBody');

/**
 * Check if a location (latitude, longitude) is within any protected water body
 * Uses MongoDB's geospatial $geoIntersects operator for 2dsphere queries
 *
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate  
 * @returns {Promise<Object>} Verification result with matching water bodies
 */
async function verifyLocationWithinWaterBody(latitude, longitude) {
    try {
        const result = {
            verified: false,
            withinWaterBody: false,
            waterBodies: [],
            coordinates: [latitude, longitude],
            timestamp: new Date().toISOString()
        };

        // Query for water bodies that intersect with the complaint location
        const waterBodies = await WaterBody.find({
            geometry: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]  // [lng, lat] format for GeoJSON
                    }
                }
            },
            status: 'active'
        });

        if (waterBodies.length > 0) {
            result.verified = true;
            result.withinWaterBody = true;
            result.waterBodies = waterBodies.map(wb => ({
                id: wb._id,
                name: wb.name,
                district: wb.district,
                protectionLevel: wb.protectionLevel,
                area: wb.area
            }));

            console.log(`[Geospatial] Location verified within ${waterBodies.length} water body(ies)`);
        } else {
            console.log('[Geospatial] Location verified - NOT within any water body');
        }

        return result;

    } catch (error) {
        console.error('[Geospatial] Error verifying location:', error);
        throw error;
    }
}

/**
 * Calculate distance between complaint location and water body boundary
 * Returns approximate distance in kilometers
 *
 * @param {number} latitude - Complaint latitude
 * @param {number} longitude - Complaint longitude
 * @returns {Promise<Object>} Nearest water body with distance
 */
async function findNearestWaterBody(latitude, longitude) {
    try {
        // Use $geoNear aggregation for distance-based queries
        const result = await WaterBody.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    distanceField: 'distance',
                    maxDistance: 50000, // 50km radius
                    spherical: true
                }
            }
        ]);

        if (result.length > 0) {
            const nearest = result[0];
            const distanceMeters = nearest.distance;
            const distanceKm = (distanceMeters / 1000).toFixed(2);

            console.log(`[Geospatial] Nearest water body: ${nearest.name} (${distanceKm}km away)`);

            return {
                found: true,
                nearestWaterBody: {
                    id: nearest._id,
                    name: nearest.name,
                    district: nearest.district,
                    distanceKm: parseFloat(distanceKm),
                    protectionLevel: nearest.protectionLevel
                }
            };
        } else {
            return {
                found: false,
                message: 'No water bodies within 50km radius'
            };
        }

    } catch (error) {
        console.error('[Geospatial] Error finding nearest water body:', error);
        throw error;
    }
}

/**
 * Batch verify multiple complaint locations
 * Efficient for processing multiple complaints at once
 *
 * @param {Array<Object>} complaints - Array of complaint objects with latitude/longitude
 * @returns {Promise<Array>} Array of verification results
 */
async function batchVerifyLocations(complaints) {
    try {
        const verificationResults = await Promise.all(
            complaints.map(complaint =>
                verifyLocationWithinWaterBody(complaint.latitude, complaint.longitude)
                    .then(result => ({
                        complaintId: complaint._id,
                        ...result
                    }))
            )
        );

        const verifiedCount = verificationResults.filter(r => r.verified).length;
        console.log(`[Geospatial] Batch verification: ${verifiedCount}/${complaints.length} verified`);

        return verificationResults;

    } catch (error) {
        console.error('[Geospatial] Error in batch verification:', error);
        throw error;
    }
}

/**
 * Get all protected water bodies
 * Returns list of all active water bodies with their boundaries
 *
 * @returns {Promise<Array>} Array of water bodies
 */
async function getAllProtectedWaterBodies() {
    try {
        const waterBodies = await WaterBody.find({
            status: 'active'
        }).sort({ protectionLevel: -1, name: 1 });

        console.log(`[Geospatial] Retrieved ${waterBodies.length} protected water bodies`);

        return waterBodies.map(wb => ({
            id: wb._id,
            name: wb.name,
            district: wb.district,
            state: wb.state,
            protectionLevel: wb.protectionLevel,
            area: wb.area,
            description: wb.description,
            coordinates: wb.geometry.coordinates
        }));

    } catch (error) {
        console.error('[Geospatial] Error retrieving water bodies:', error);
        throw error;
    }
}

/**
 * Calculate verification confidence score
 * Higher score indicates better location verification
 *
 * @param {string} complaintId - Complaint ID
 * @returns {Promise<Object>} Confidence score breakdown
 */
async function calculateVerificationConfidenceScore(complaintId) {
    try {
        // This is a placeholder - in production, would calculate based on:
        // - How close the point is to multiple water body boundaries
        // - Historical data accuracy for the district
        // - AI image detection confidence
        // - Crowd verification votes

        const confidenceScore = {
            locationConfidence: 0.95,
            geospatialVerification: 85,
            distanceFromBoundary: 'within_boundary',
            overallScore: 0.85,
            recommendedAction: 'PROCEED_WITH_VERIFICATION'
        };

        return confidenceScore;

    } catch (error) {
        console.error('[Geospatial] Error calculating confidence score:', error);
        throw error;
    }
}

/**
 * Generate verification report for a complaint
 * Comprehensive geospatial verification details
 *
 * @param {Object} complaint - Complaint document with location
 * @returns {Promise<Object>} Detailed verification report
 */
async function generateVerificationReport(complaint) {
    try {
        const locationVerification = await verifyLocationWithinWaterBody(
            complaint.latitude,
            complaint.longitude
        );

        const nearestWaterBody = await findNearestWaterBody(
            complaint.latitude,
            complaint.longitude
        );

        const report = {
            complaintId: complaint._id,
            location: {
                latitude: complaint.latitude,
                longitude: complaint.longitude,
                address: complaint.address
            },
            verification: {
                withinWaterBody: locationVerification.withinWaterBody,
                matchingWaterBodies: locationVerification.waterBodies
            },
            proximity: {
                nearestWaterBody: nearestWaterBody.nearestWaterBody,
                withinProtectedArea: locationVerification.waterBodies.length > 0
            },
            recommendations: generateRecommendations(
                locationVerification,
                complaint
            ),
            timestamp: new Date().toISOString()
        };

        return report;

    } catch (error) {
        console.error('[Geospatial] Error generating verification report:', error);
        throw error;
    }
}

/**
 * Generate recommendations based on geospatial verification
 *
 * @param {Object} verification - Verification result
 * @param {Object} complaint - Complaint document
 * @returns {Array<string>} Array of recommendations
 */
function generateRecommendations(verification, complaint) {
    const recommendations = [];

    if (verification.withinWaterBody) {
        recommendations.push('Location is within protected water body boundary');
        recommendations.push('Escalate for immediate investigation');
        
        if (verification.waterBodies.length > 1) {
            recommendations.push(`Located in ${verification.waterBodies.length} overlapping protected areas`);
        }

        // Check protection level
        const highestProtection = verification.waterBodies.reduce((max, wb) =>
            (wb.protectionLevel === 'high') ? wb : max
        );
        if (highestProtection && highestProtection.protectionLevel === 'high') {
            recommendations.push('This area has HIGH protection level - prioritize response');
        }
    } else {
        recommendations.push('Location is outside protected water body boundaries');
        recommendations.push('May still require verification if near boundary');
        recommendations.push('Check if location is affected by water body activities');
    }

    return recommendations;
}

/**
 * Update water body boundary (admin function)
 * Allows updating polygon boundaries for water bodies
 *
 * @param {string} waterBodyId - Water body ID
 * @param {Object} newGeometry - New GeoJSON geometry
 * @returns {Promise<Object>} Updated water body
 */
async function updateWaterBodyBoundary(waterBodyId, newGeometry) {
    try {
        const waterBody = await WaterBody.findByIdAndUpdate(
            waterBodyId,
            {
                geometry: newGeometry,
                location: newGeometry,
                updatedAt: new Date()
            },
            { new: true }
        );

        console.log(`[Geospatial] Updated boundary for ${waterBody.name}`);
        return waterBody;

    } catch (error) {
        console.error('[Geospatial] Error updating water body boundary:', error);
        throw error;
    }
}

module.exports = {
    verifyLocationWithinWaterBody,
    findNearestWaterBody,
    batchVerifyLocations,
    getAllProtectedWaterBodies,
    calculateVerificationConfidenceScore,
    generateVerificationReport,
    updateWaterBodyBoundary
};
