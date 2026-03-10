/**
 * Water Bodies Seed Data
 * Sample GeoJSON polygon data for Tamil Nadu water bodies
 * 
 * Usage:
 * node seed-waterbodies.js
 * 
 * This script populates the MongoDB database with sample Tamil Nadu water bodies
 * Each water body includes GeoJSON polygon coordinates for geospatial queries
 */

require('dotenv').config();
const mongoose = require('mongoose');
const WaterBody = require('./models/WaterBody');

const sampleWaterBodies = [
    {
        name: 'Cooum River (Chennai)',
        description: 'Urban river flowing through Chennai city',
        district: 'Chennai',
        state: 'Tamil Nadu',
        protectionLevel: 'high',
        area: 45.5,
        // Polygon coordinates: [longitude, latitude] format
        // This is a simplified boundary around Cooum River in Chennai
        location: {
            type: 'Polygon',
            coordinates: [[
                [80.2, 13.0],
                [80.25, 13.0],
                [80.25, 13.08],
                [80.2, 13.08],
                [80.2, 13.0]
            ]]
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [80.2, 13.0],
                [80.25, 13.0],
                [80.25, 13.08],
                [80.2, 13.08],
                [80.2, 13.0]
            ]]
        }
    },
    {
        name: 'Adyar River (Chennai)',
        description: 'Perennial river in Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        protectionLevel: 'high',
        area: 52.8,
        location: {
            type: 'Polygon',
            coordinates: [[
                [80.25, 12.95],
                [80.32, 12.95],
                [80.32, 13.05],
                [80.25, 13.05],
                [80.25, 12.95]
            ]]
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [80.25, 12.95],
                [80.32, 12.95],
                [80.32, 13.05],
                [80.25, 13.05],
                [80.25, 12.95]
            ]]
        }
    },
    {
        name: 'Palar River',
        description: 'Seasonal river in Chengalpattu district',
        district: 'Chengalpattu',
        state: 'Tamil Nadu',
        protectionLevel: 'medium',
        area: 38.2,
        location: {
            type: 'Polygon',
            coordinates: [[
                [79.9, 12.7],
                [80.1, 12.7],
                [80.1, 12.85],
                [79.9, 12.85],
                [79.9, 12.7]
            ]]
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [79.9, 12.7],
                [80.1, 12.7],
                [80.1, 12.85],
                [79.9, 12.85],
                [79.9, 12.7]
            ]]
        }
    },
    {
        name: 'Buckingham Canal',
        description: 'Historic canal system in Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        protectionLevel: 'medium',
        area: 28.5,
        location: {
            type: 'Polygon',
            coordinates: [[
                [80.18, 13.0],
                [80.22, 13.0],
                [80.22, 13.1],
                [80.18, 13.1],
                [80.18, 13.0]
            ]]
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [80.18, 13.0],
                [80.22, 13.0],
                [80.22, 13.1],
                [80.18, 13.1],
                [80.18, 13.0]
            ]]
        }
    },
    {
        name: 'Pulicat Lake',
        description: 'Large lagoon between Tamil Nadu and Andhra Pradesh',
        district: 'Tiruvallur',
        state: 'Tamil Nadu',
        protectionLevel: 'high',
        area: 97.3,
        location: {
            type: 'Polygon',
            coordinates: [[
                [79.8, 13.15],
                [79.95, 13.15],
                [79.95, 13.35],
                [79.8, 13.35],
                [79.8, 13.15]
            ]]
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [79.8, 13.15],
                [79.95, 13.15],
                [79.95, 13.35],
                [79.8, 13.35],
                [79.8, 13.15]
            ]]
        }
    },
    {
        name: 'Vellar Estuary',
        description: 'Estuary in Cuddalore district',
        district: 'Cuddalore',
        state: 'Tamil Nadu',
        protectionLevel: 'high',
        area: 42.1,
        location: {
            type: 'Polygon',
            coordinates: [[
                [79.85, 12.2],
                [80.0, 12.2],
                [80.0, 12.35],
                [79.85, 12.35],
                [79.85, 12.2]
            ]]
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [79.85, 12.2],
                [80.0, 12.2],
                [80.0, 12.35],
                [79.85, 12.35],
                [79.85, 12.2]
            ]]
        }
    },
    {
        name: 'Chembarambakkam Lake',
        description: 'Reservoir in Kanchipuram district',
        district: 'Kanchipuram',
        state: 'Tamil Nadu',
        protectionLevel: 'medium',
        area: 35.6,
        location: {
            type: 'Polygon',
            coordinates: [[
                [79.95, 12.8],
                [80.12, 12.8],
                [80.12, 12.95],
                [79.95, 12.95],
                [79.95, 12.8]
            ]]
        },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [79.95, 12.8],
                [80.12, 12.8],
                [80.12, 12.95],
                [79.95, 12.95],
                [79.95, 12.8]
            ]]
        }
    }
];

/**
 * Seed database with water bodies
 */
async function seedWaterBodies() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tnwbams";
        await mongoose.connect(mongoURI);
        console.log('✓ Connected to MongoDB');

        // Clear existing water bodies (optional - comment out if you want to keep existing data)
        // const deleteResult = await WaterBody.deleteMany({});
        // console.log(`✓ Cleared ${deleteResult.deletedCount} existing water bodies`);

        // Insert sample data
        const result = await WaterBody.insertMany(sampleWaterBodies);
        console.log(`✓ Successfully inserted ${result.length} water bodies`);

        // Display inserted data
        console.log('\n📍 Inserted Water Bodies:');
        result.forEach((wb, index) => {
            console.log(`${index + 1}. ${wb.name} (${wb.district})`);
            console.log(`   - Area: ${wb.area} km²`);
            console.log(`   - Protection: ${wb.protectionLevel}`);
            console.log(`   - Coordinates: ${JSON.stringify(wb.geometry.coordinates[0][0])}`);
        });

        console.log('\n✓ Water bodies seed data loaded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('✗ Error seeding water bodies:', error);
        process.exit(1);
    }
}

// Run seed if executed directly
if (require.main === module) {
    seedWaterBodies();
}

module.exports = { sampleWaterBodies };
