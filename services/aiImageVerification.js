/**
 * AI Image Verification Service
 * Analyzes uploaded complaint images using TensorFlow.js
 * Detects environmental hazards like garbage, construction, pollution, etc.
 */

const fs = require('fs');
const path = require('path');

// Optional TensorFlow dependencies with fallback
let tf = null;
let coco = null;
let modelAvailable = false;

try {
    tf = require('@tensorflow/tfjs-node');
    coco = require('@tensorflow-models/coco-ssd');
    modelAvailable = true;
} catch (error) {
    console.warn('[AI Verification] TensorFlow modules not available. Using mock analysis mode.');
    modelAvailable = false;
}

/**
 * Global model cache to avoid reloading model multiple times
 */
let cocoModel = null;

/**
 * Initialize COCO-SSD model
 * This is a pre-trained model that detects 90 different object classes
 * Relevant for water body complaints: garbage, construction, vehicles, etc.
 */
async function initializeModel() {
    if (!modelAvailable) {
        return null;
    }
    
    if (cocoModel === null) {
        try {
            console.log('[AI Verification] Loading COCO-SSD model...');
            cocoModel = await coco.load();
            console.log('[AI Verification] COCO-SSD model loaded successfully');
        } catch (error) {
            console.error('[AI Verification] Error loading model:', error);
            modelAvailable = false;
            return null;
        }
    }
    return cocoModel;
}

/**
 * Analyze image and detect objects/environmental hazards
 *
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} Analysis result with labels and confidence score
 *
 * Returns:
 * {
 *   labels: ['garbage', 'construction', 'pollution'],
 *   confidenceScore: 0.85,
 *   detections: [
 *     { class: 'garbage', score: 0.92, bbox: [...] },
 *     { class: 'construction', score: 0.78, bbox: [...] }
 *   ],
 *   relevantObjectsCount: 2,
 *   environmentalHazardDetected: true,
 *   timestamp: '2024-03-09T10:30:00Z'
 * }
 */
async function analyzeImage(imagePath) {
    try {
        // Validate file exists
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Image file not found: ${imagePath}`);
        }

        console.log(`[AI Verification] Analyzing image: ${imagePath}`);

        // If TensorFlow is not available, use mock analysis
        if (!modelAvailable) {
            console.log('[AI Verification] Using mock analysis mode (TensorFlow not available)');
            return generateMockAnalysis(imagePath);
        }

        // Initialize model if not already loaded
        const model = await initializeModel();
        if (!model) {
            console.log('[AI Verification] Model failed to load, using mock analysis');
            return generateMockAnalysis(imagePath);
        }

        // Read image and convert to tensor
        const imageData = fs.readFileSync(imagePath);

        // Decode as 3-channel RGB (channels=3) to avoid alpha-channel issues
        const decodedImage = tf.node.decodeImage(imageData, 3);

        // Detect objects using COCO-SSD
        const predictions = await model.detect(decodedImage);
        decodedImage.dispose();

        // Map detected objects to environmental categories
        const analysisResult = categorizeDetections(predictions);

        // Calculate overall confidence score
        const confidenceScore = analysisResult.detections.length > 0
            ? (analysisResult.detections.reduce((sum, d) => sum + d.score, 0) / analysisResult.detections.length)
            : 0;

        // Extract unique labels (threat categories)
        const uniqueLabels = [...new Set(analysisResult.detections.map(d => d.class))];

        console.log(`[AI Verification] Detection complete:`, {
            labels: uniqueLabels,
            confidenceScore: confidenceScore.toFixed(3),
            detectionsCount: analysisResult.detections.length
        });

        return {
            labels: uniqueLabels,
            confidenceScore: parseFloat(confidenceScore.toFixed(3)),
            detections: analysisResult.detections,
            relevantObjectsCount: analysisResult.detections.length,
            environmentalHazardDetected: analysisResult.detections.length > 0,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('[AI Verification] Error analyzing image:', error.message);
        throw error;
    }
}

/**
 * Categorize COCO-SSD detections into environmental threat categories
 * Maps 90 COCO object classes to water body pollution threat categories
 *
 * @param {Array} predictions - Array of predictions from COCO-SSD
 * @returns {Object} Categorized detections
 */
function categorizeDetections(predictions) {
    // FIX: removed duplicate entries ('skateboard', 'bottle') from garbage array
    const threatCategories = {
        garbage: [
            'backpack', 'bottle', 'can', 'cup', 'fork', 'knife', 'spoon',
            'bowl', 'banana', 'apple', 'sandwich', 'hot dog', 'pizza',
            'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed',
            'teddy bear', 'suitcase', 'frisbee', 'skis', 'skateboard',
            'sports ball', 'kite', 'baseball bat', 'baseball glove',
            'surfboard', 'tennis racket', 'wine glass'
        ],
        construction: [
            'construction vehicle', 'excavator', 'crane', 'truck', 'bus',
            'train', 'car', 'motorcycle', 'bicycle'
        ],
        pollution: [
            'car', 'truck', 'bus', 'train', 'motorcycle', 'bicycle',
            'airplane', 'bottle', 'cup'
        ],
        hazard: [
            'person', 'dog', 'cat', 'bird'
        ]
    };

    const detections = [];
    const processedClasses = new Set();

    for (const prediction of predictions) {
        const objectClass = prediction.class;

        // Skip if already processed to avoid duplicates
        if (processedClasses.has(objectClass)) continue;

        let category = null;

        // Map COCO class to threat category
        for (const [threatType, classList] of Object.entries(threatCategories)) {
            if (classList.includes(objectClass.toLowerCase())) {
                category = threatType;
                break;
            }
        }

        // Only include relevant threat detections
        if (category) {
            detections.push({
                class: category,
                cocoClass: objectClass,
                score: parseFloat(prediction.score.toFixed(3)),
                bbox: prediction.bbox
            });
            processedClasses.add(objectClass);
        }
    }

    return { detections };
}

/**
 * Generate mock analysis when TensorFlow is not available
 * @param {string} imagePath - Path to the image file
 * @returns {Object} Mock analysis result
 */
function generateMockAnalysis(imagePath) {
    return getMockAnalysisResult(imagePath);
}

/**
 * Analyze image with fallback to lightweight model
 * If TensorFlow fails, falls back to mock predictions for development
 *
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} Analysis result
 */
async function analyzeImageWithFallback(imagePath) {
    try {
        return await analyzeImage(imagePath);
    } catch (error) {
        console.warn('[AI Verification] TensorFlow analysis failed, using fallback mock model');
        return getMockAnalysisResult(imagePath);
    }
}

/**
 * Mock analysis result for testing/development
 * Returns realistic mock data when TensorFlow is unavailable
 *
 * @param {string} imagePath - Path to the image file
 * @returns {Object} Mock analysis result
 */
function getMockAnalysisResult(imagePath) {
    const mockResults = [
        {
            labels: ['garbage', 'construction'],
            confidenceScore: 0.87,
            detections: [
                { class: 'garbage', score: 0.92 },
                { class: 'construction', score: 0.82 }
            ],
            relevantObjectsCount: 2,
            environmentalHazardDetected: true
        },
        {
            labels: ['garbage', 'pollution'],
            confidenceScore: 0.79,
            detections: [
                { class: 'garbage', score: 0.85 },
                { class: 'pollution', score: 0.73 }
            ],
            relevantObjectsCount: 2,
            environmentalHazardDetected: true
        },
        {
            labels: ['construction'],
            confidenceScore: 0.88,
            detections: [
                { class: 'construction', score: 0.88 }
            ],
            relevantObjectsCount: 1,
            environmentalHazardDetected: true
        },
        {
            labels: [],
            confidenceScore: 0,
            detections: [],
            relevantObjectsCount: 0,
            environmentalHazardDetected: false
        }
    ];

    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    return {
        ...randomResult,
        timestamp: new Date().toISOString(),
        mocked: true
    };
}

/**
 * Batch analyze multiple images
 *
 * @param {Array<string>} imagePaths - Array of image file paths
 * @returns {Promise<Array>} Array of analysis results
 */
async function analyzeImages(imagePaths) {
    try {
        const results = await Promise.all(
            imagePaths.map(imagePath => analyzeImageWithFallback(imagePath))
        );
        return results;
    } catch (error) {
        console.error('[AI Verification] Error in batch analysis:', error.message);
        throw error;
    }
}

/**
 * Cleanup and dispose of resources
 */
async function cleanup() {
    if (cocoModel) {
        console.log('[AI Verification] Cleaning up model resources');
        cocoModel = null;
        // FIX: tf.dispose() is incorrect; use tf.engine().reset() to free all tensors
        tf.engine().reset();
    }
}

module.exports = {
    analyzeImage,
    analyzeImageWithFallback,
    analyzeImages,
    initializeModel,
    cleanup,
    getMockAnalysisResult
};