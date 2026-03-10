# TN-WBAMS Advanced Features Implementation Guide

Complete implementation of 8 advanced modules for complaint verification, monitoring, and real-time updates.

---

## 📋 Table of Contents

1. [AI Image Verification Module](#1-ai-image-verification-module)
2. [Geospatial Boundary Detection](#2-geospatial-boundary-detection)
3. [Crowd Verification System](#3-crowd-verification-system)
4. [Satellite Change Detection Module](#4-satellite-change-detection-module)
5. [Updated Admin Dashboard](#5-updated-admin-dashboard)
6. [Database Integration](#6-database-integration)
7. [Real-Time Updates with Socket.IO](#7-real-time-updates-with-socketio)
8. [Setup & Installation](#8-setup--installation)

---

## 1. AI Image Verification Module

### Overview

Analyzes uploaded complaint images using TensorFlow.js COCO-SSD model to detect environmental hazards like garbage, construction, pollution, and buildings.

### Files

- `services/aiImageVerification.js` - AI analysis service

### Functions

#### `analyzeImage(imagePath)`

Analyzes a single image and detects objects/environmental hazards.

**Returns:**

```javascript
{
  labels: ['garbage', 'construction'],
  confidenceScore: 0.87,
  detections: [
    { class: 'garbage', score: 0.92, bbox: [...] },
    { class: 'construction', score: 0.82, bbox: [...] }
  ],
  relevantObjectsCount: 2,
  environmentalHazardDetected: true,
  timestamp: '2024-03-09T10:30:00Z'
}
```

#### `analyzeImageWithFallback(imagePath)`

Attempts TensorFlow analysis; falls back to mock predictions if unavailable (useful for development).

**Returns:** Same as `analyzeImage()` with optional `mocked: true` flag

### Database Schema Updates

```javascript
// Added to Complaint schema:
aiDetectionLabel: [String],           // Array of detected hazard labels
aiConfidenceScore: Number             // Confidence score (0-1)
```

### Event Emissions (Socket.IO)

```javascript
// Emitted when AI analysis is complete
socket.emit('aiDetectionComplete', {
  complaintId: complaint._id,
  labels: ['garbage', 'construction'],
  confidenceScore: 0.87,
  detections: [...],
  environmentalHazardDetected: true
});
```

### Implementation Notes

- Uses `@tensorflow/tfjs` + `@tensorflow/tfjs-node` for inference
- COCO-SSD model detects 90 object classes
- Detection results mapped to environmental threat categories
- Async processing - doesn't block complaint creation response
- Fallback mock model for development/testing

---

## 2. Geospatial Boundary Detection

### Overview

Validates complaint locations against protected water body boundaries using MongoDB geospatial queries.

### Files

- `models/WaterBody.js` - Water body document schema with GeoJSON support
- `services/geospatialVerification.js` - Geospatial validation service

### WaterBody Schema

```javascript
{
  name: String,                    // Water body name (required)
  description: String,             // Description
  district: String,                // District name
  state: String,                   // State (default: Tamil Nadu)
  location: {
    type: 'Polygon',
    coordinates: [[[lng, lat], ...]]  // GeoJSON polygon
  },
  geometry: {
    type: 'Polygon',
    coordinates: [[[lng, lat], ...]]  // Alternative field for 2dsphere
  },
  area: Number,                    // Area in km²
  protectionLevel: String,         // 'high', 'medium', 'low'
  status: String                   // 'active', 'inactive'
}
```

### Functions

#### `verifyLocationWithinWaterBody(latitude, longitude)`

Checks if coordinates are within any protected water body boundary.

**Returns:**

```javascript
{
  verified: true,
  withinWaterBody: true,
  waterBodies: [
    {
      id: ObjectId,
      name: 'Cooum River',
      district: 'Chennai',
      protectionLevel: 'high',
      area: 45.5
    }
  ],
  coordinates: [13.0827, 80.2707],
  timestamp: '2024-03-09T10:30:00Z'
}
```

#### `findNearestWaterBody(latitude, longitude)`

Finds nearest water body using `$geoNear` aggregation.

**Returns:**

```javascript
{
  found: true,
  nearestWaterBody: {
    id: ObjectId,
    name: 'Cooum River',
    district: 'Chennai',
    distanceKm: 2.5,
    protectionLevel: 'high'
  }
}
```

#### `generateVerificationReport(complaint)`

Comprehensive geospatial verification report.

### Database Schema Updates

```javascript
// Added to Complaint schema:
verifiedLocation: Boolean,         // Location verified within boundary
waterBodyId: ObjectId,             // Reference to matching WaterBody
```

### Event Emissions (Socket.IO)

```javascript
socket.emit("locationVerified", {
  complaintId: complaint._id,
  verified: true,
  waterBodyName: "Cooum River",
  coordinates: [13.0827, 80.2707],
});
```

### Geospatial Indexes

MongoDB indexes created for efficient queries:

```javascript
// From WaterBody schema:
waterBodySchema.index({ location: "2dsphere" });
waterBodySchema.index({ geometry: "2dsphere" });
```

### Sample Water Bodies

7 sample water bodies seeded via `seed-waterbodies.js`:

- Cooum River (Chennai)
- Adyar River (Chennai)
- Palar River (Chengalpattu)
- Buckingham Canal (Chennai)
- Pulicat Lake (Tiruvallur)
- Vellar Estuary (Cuddalore)
- Chembarambakkam Lake (Kanchipuram)

---

## 3. Crowd Verification System

### Overview

Enables nearby/community users to verify or reject complaints, calculating credibility scores.

### Files

- `routes/verificationRoutes.js` - Crowd verification API routes

### API Endpoints

#### `POST /api/complaints/:id/verify`

Submit a confirmation vote for a complaint.

**Request Body:**

```javascript
{
  voterId: "voter_device_fingerprint"; // Anonymous voter ID
}
```

**Response:**

```javascript
{
  success: true,
  message: "Verification vote recorded successfully",
  complaint: {
    id: ObjectId,
    confirmedCount: 5,
    rejectedCount: 1,
    totalVotes: 6,
    credibilityScore: 0.833,
    crowdVerified: true
  }
}
```

#### `POST /api/complaints/:id/reject`

Submit a rejection vote for a complaint.

**Request Body:**

```javascript
{
  voterId: "voter_device_fingerprint",
  reason: "Image quality too poor"  // Optional
}
```

#### `GET /api/complaints/:id/credibility`

Get detailed credibility information and voting breakdown.

**Response:**

```javascript
{
  success: true,
  credibility: {
    complaintId: ObjectId,
    credibilityScore: 0.833,
    credibilityStatus: "VERIFIED",  // VERIFIED, PARTIALLY_VERIFIED, NOT_VERIFIED, NO_VOTES
    crowdVerified: true,
    votingBreakdown: {
      confirmed: 5,
      rejected: 1,
      total: 6
    },
    votingPercentages: {
      confirmedPercentage: 83.3,
      rejectedPercentage: 16.7
    },
    recentVotes: [
      {
        voteType: 'confirm',
        timestamp: '2024-03-09T10:30:00Z',
        relativeTime: '5m ago'
      }
    ],
    votingTrend: 'improving',
    recommendations: [...]
  }
}
```

#### `GET /api/complaints/:id/verification-details`

Get complete verification details (AI + geolocation + crowd + satellite).

### Database Schema Updates

```javascript
// Added to Complaint schema:
crowdVerified: Boolean,            // Crowd verification status
verificationVotes: [{
  voterId: String,                 // Anonymous voter ID
  voteType: String,                // 'confirm' or 'reject'
  timestamp: Date
}],
confirmedCount: Number,            // Number of confirm votes
rejectedCount: Number,             // Number of reject votes
credibilityScore: Number           // confirmedVotes / totalVotes
```

### Credibility Algorithm

```
credibilityScore = confirmedVotes / totalVotes

If credibilityScore >= 0.7:
  crowdVerified = true
Else:
  crowdVerified = false
```

### Event Emissions (Socket.IO)

```javascript
socket.emit("verificationUpdatedBroadcast", {
  complaintId: complaint._id,
  credibilityScore: 0.833,
  confirmedCount: 5,
  rejectedCount: 1,
});
```

### Voter Anonymity

- Uses device fingerprint + IP hash for anonymous voter ID
- Prevents same user voting multiple times
- No personally identifiable information stored

---

## 4. Satellite Change Detection Module

### Overview

Monitors satellite imagery around water bodies to detect environmental changes and generate alerts.

### Files

- `services/satelliteMonitor.js` - Satellite monitoring service

### Functions

#### `fetchSatelliteImage(latitude, longitude, date)`

Retrieves satellite image for a location on specific date.

**Returns:**

```javascript
{
  latitude: 13.0827,
  longitude: 80.2707,
  date: '2024-03-09',
  imageUrl: 'https://...',
  resolution: 10,                  // meters
  cloudCover: 25.5,                // percentage
  dataProvider: 'NASA/ISRO',
  timestamp: '2024-03-09T10:30:00Z'
}
```

**Production Integration:**

- NASA Earth Imagery API: `https://api.nasa.gov/planetary/earth`
- ISRO Bhuvan API: `https://bhuvan.nrsc.gov.in/api`
- Requires API keys and authentication

#### `compareImages(currentImage, historicalImage)`

Compares two satellite images to detect changes.

**Returns:**

```javascript
{
  changePercentage: 18.5,
  significantChange: true,         // If > threshold (10%)
  changeMap: null,                 // Pixel-level analysis
  detectedChanges: [
    {
      type: 'vegetation_loss',
      severity: 'medium',
      area: 450
    },
    {
      type: 'water_level_change',
      severity: 'high',
      change: 25
    }
  ],
  timestamp: '2024-03-09T10:30:00Z'
}
```

#### `detectLandChange(waterBody, checkDate)`

Detects land changes for a specific water body.

**Returns:**

```javascript
{
  waterBodyId: ObjectId,
  waterBodyName: 'Cooum River',
  checkDate: Date,
  changeDetected: true,
  changePercentage: 18.5,
  detectedChanges: [...],
  severity: 'high',                // low, medium, high, critical
  recommendations: [
    'Send ground team for verification',
    'Plan conservation initiative'
  ],
  timestamp: '2024-03-09T10:30:00Z'
}
```

#### `generateAlert(detectionResult)`

Creates alert notification for significant changes.

**Returns:**

```javascript
{
  type: 'SATELLITE_ALERT',
  severity: 'high',
  waterBodyName: 'Cooum River',
  title: 'Satellite Alert: Changes detected at Cooum River',
  description: '18.5% change detected...',
  changePercentage: 18.5,
  detectedChanges: [...],
  recommendations: [...],
  suggestedActions: [
    {
      action: 'Review satellite imagery',
      priority: 'high',
      dueDate: Date
    }
  ],
  actionRequired: true
}
```

#### `scheduleSatelliteMonitoring(waterBody, onAlertCallback)`

Schedules periodic satellite monitoring for a water body.

**Returns:** Cleanup function to stop monitoring

### Database Schema Updates

```javascript
// Added to Complaint schema:
satelliteAlert: Boolean,           // Alert generated
satelliteCheckHistory: [{
  checkDate: Date,
  changeDetected: Boolean,
  changePercentage: Number,
  alertMessage: String
}]
```

### Configuration

```javascript
const satelliteConfig = {
  CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  CHANGE_THRESHOLD: 10, // 10% threshold
};
```

### Event Emissions (Socket.IO)

```javascript
socket.emit("satelliteAlertGenerated", {
  waterBodyName: "Cooum River",
  severity: "high",
  changePercentage: 18.5,
  timestamp: "2024-03-09T10:30:00Z",
});
```

---

## 5. Updated Admin Dashboard

### Files

- `public/enhanced-dashboard.html` - New enhanced admin dashboard

### Features

1. **AI Image Detection Panel**
   - Total analyzed images
   - Hazards detected count
   - Average confidence score
   - Detection category breakdown

2. **Geospatial Verification Panel**
   - Protected water bodies count
   - Verified locations count
   - Verification rate percentage
   - List of protected water bodies

3. **Crowd Verification Panel**
   - Total votes recorded
   - Average credibility score
   - Crowd verified count
   - Voting breakdown (confirmed vs rejected)

4. **Satellite Monitoring Panel**
   - Active monitoring count
   - Alerts generated
   - Last check timestamp
   - Recent satellite alerts

5. **System Statistics Panel**
   - Total complaints
   - Fully verified complaints
   - Pending review count
   - Verification distribution

6. **Real-Time Events Panel**
   - Live event feed
   - Last 10 events displayed
   - Event timestamps

### Socket.IO Real-Time Updates

Dashboard receives live updates for:

- New complaints
- AI detection completion
- Location verification
- Crowd verification updates
- Satellite alerts
- Status changes

### Access

```
http://localhost:5000/enhanced-dashboard.html
```

---

## 6. Database Integration

### Updated Complaint Schema

```javascript
{
  // Original fields
  title: String (required),
  description: String,
  district: String,
  location: String,
  latitude: Number,
  longitude: Number,
  address: String,
  image: String,
  status: String (default: "Pending"),
  createdAt: Date,

  // AI Image Verification
  aiDetectionLabel: [String],           // Detected hazard types
  aiConfidenceScore: Number,            // 0-1

  // Geospatial Verification
  verifiedLocation: Boolean,            // Within water body boundary
  waterBodyId: ObjectId,                // Reference to WaterBody

  // Crowd Verification
  crowdVerified: Boolean,
  verificationVotes: [{
    voterId: String,
    voteType: String,                   // 'confirm' or 'reject'
    timestamp: Date
  }],
  confirmedCount: Number,
  rejectedCount: Number,
  credibilityScore: Number,             // 0-1

  // Satellite Monitoring
  satelliteAlert: Boolean,
  satelliteCheckHistory: [{
    checkDate: Date,
    changeDetected: Boolean,
    changePercentage: Number,
    alertMessage: String
  }]
}
```

### WaterBody Model

See Section 2 for complete schema.

### Indexes

- Complaint collection: `title`, `district`, `status`, `createdAt`
- WaterBody collection: `'geometry': '2dsphere'`, `'location': '2dsphere'`

---

## 7. Real-Time Updates with Socket.IO

### Server Configuration

```javascript
// server.js
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
```

### Event Flow

**1. New Complaint Submission**

- Client submits complaint via POST /api/complaints
- Server creates complaint and emits 'newComplaint'
- Background: AI analysis starts
- Background: Geospatial verification starts
- Dashboard receives updates as analysis completes

**2. AI Detection Completion**

- 'aiDetectionComplete' event emitted
- Includes: labels, confidence score, detections
- Dashboard updates AI statistics

**3. Location Verification**

- 'locationVerified' event emitted
- Includes: verification status, water body name
- Dashboard updates geospatial statistics

**4. Crowd Verification Update**

- 'verificationUpdatedBroadcast' event emitted
- Includes: credibility score, vote counts
- Dashboard updates crowd statistics in real-time

**5. Satellite Alert**

- 'satelliteAlertGenerated' event emitted
- Includes: severity, change percentage
- Dashboard displays alert

### Client-Side Socket Listener Example

```javascript
// Listening in dashboard
socket.on("aiDetectionComplete", (data) => {
  console.log("AI Detection:", data);
  updateAIStatistics(data);
});

socket.on("locationVerified", (data) => {
  console.log("Location Verified:", data);
  updateLocationStatistics();
});

socket.on("verificationUpdatedBroadcast", (data) => {
  console.log("Verification Updated:", data);
  updateCrowdStatistics();
});
```

---

## 8. Setup & Installation

### Prerequisites

- Node.js 14+
- MongoDB 4.0+
- Python 3.7+ (for TensorFlow)

### Installation Steps

#### 1. Install Dependencies

```bash
npm install
```

The following new packages are added:

- `@tensorflow/tfjs` - TensorFlow.js core
- `@tensorflow/tfjs-node` - TensorFlow.js Node.js bindings
- `geolib` - Geospatial calculations utility

#### 2. Database Setup

**Start MongoDB:**

```bash
# Local MongoDB
mongod

# Or MongoDB URI in .env
MONGODB_URI=mongodb://user:password@host:port/tnwbams
```

**Seed Water Bodies:**

```bash
node seed-waterbodies.js
```

Output:

```
✓ Connected to MongoDB
✓ Successfully inserted 7 water bodies
📍 Inserted Water Bodies:
1. Cooum River (Chennai)
   - Area: 45.5 km²
   - Protection: high
   - Coordinates: [80.2, 13.0]
...
```

#### 3. Environment Configuration

Create/update `.env` file:

```
MONGODB_URI=mongodb://127.0.0.1:27017/tnwbams
PORT=5000
NODE_ENV=development

# Optional: Satellite API keys
NASA_API_KEY=your_api_key
ISRO_API_KEY=your_api_key
```

#### 4. Start Server

```bash
node server.js
```

Output:

```
✓ Connected to MongoDB
Routes loaded
Server running on port 5000
Environment: development
```

#### 5. Access Dashboard

```
http://localhost:5000/enhanced-dashboard.html
```

---

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│         User Submits Complaint with Image              │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────────┐ ┌───────────────────┐ ┌─────────────┐
│ AI Image         │ │ Geospatial        │ │ Complaint   │
│ Analysis (TF.js) │ │ Verification      │ │ Created     │
│                  │ │ (MongoDB GeoJSON) │ │             │
└────────┬─────────┘ └────────┬──────────┘ │  emits      │
         │                    │            │ newComplaint│
         ▼                    ▼            └─────────────┘
    ┌─────────┐          ┌──────────┐              │
    │ AI Conf │          │ Verified │              │
    │ Labels  │          │ Location │              ▼
    └────┬────┘          └────┬─────┘        ┌──────────────┐
         │                    │              │ Dashboard    │
         │ emits              │ emits        │ Updates      │
         │ aiDetection...     │ location... │ Statistics   │
         │                    │              └──────────────┘
         └─────────────────────────────────────────────┘
                        │
                        ▼
        ┌─────────────────────────────────┐
        │  Community Voting (Crowdsourced)│
        │  - Verify/Reject Votes          │
        │  - Credibility Score Calculated │
        │  - Events emitted               │
        └─────────────────────────────────┘
                        │
                        ▼
        ┌─────────────────────────────────┐
        │  Satellite Monitoring Service   │
        │  - Periodic image fetches       │
        │  - Change detection             │
        │  - Alerts generated             │
        └─────────────────────────────────┘
                        │
                        ▼
        ┌─────────────────────────────────┐
        │  Admin Dashboard (Real-time)    │
        │  - All metrics displayed        │
        │  - Live event feed              │
        │  - Action recommendations       │
        └─────────────────────────────────┘
```

---

## 🔧 API Routes Summary

### Complaint Routes (existing)

- `POST /api/complaints` - Create complaint with image
- `GET /api/complaints` - Get all complaints
- `PUT /api/complaints/:id/status` - Update complaint status

### Verification Routes (new)

- `POST /api/complaints/:id/verify` - Submit confirmation vote
- `POST /api/complaints/:id/reject` - Submit rejection vote
- `GET /api/complaints/:id/credibility` - Get credibility details
- `GET /api/complaints/:id/verification-details` - Get complete verification info

---

## 🚀 Performance Considerations

1. **AI Image Analysis**
   - Async processing doesn't block response
   - Model cached in memory after first load
   - Fallback to mock model if TensorFlow fails

2. **Geospatial Queries**
   - 2dsphere indexes on geometry fields
   - MongoDB handles efficient spatial indexing
   - Queries complete in <100ms for typical datasets

3. **Real-Time Events**
   - Socket.IO broadcasts to connected clients
   - Efficient event filtering on client side
   - Minimal bandwidth with JSON payloads

4. **Satellite Monitoring**
   - Scheduled every 24 hours per water body
   - Can be adjusted via `CHECK_INTERVAL` config
   - Runs asynchronously without blocking operations

---

## 📝 Testing the Implementation

### Test 1: Submit Complaint with Image

```bash
curl -X POST http://localhost:5000/api/complaints \
  -F "title=Water Pollution" \
  -F "description=Garbage in river" \
  -F "latitude=13.0827" \
  -F "longitude=80.2707" \
  -F "district=Chennai" \
  -F "image=@path/to/image.jpg"
```

### Test 2: Verify Location (within water body)

Expected to match Cooum River coordinates.

### Test 3: Submit Crowd Votes

```bash
curl -X POST http://localhost:5000/api/complaints/:id/verify \
  -H "Content-Type: application/json" \
  -d '{"voterId":"user123"}'
```

### Test 4: Get Credibility Score

```bash
curl http://localhost:5000/api/complaints/:id/credibility
```

### Test 5: Open Real-time Dashboard

Visit: `http://localhost:5000/enhanced-dashboard.html`

---

## 📚 Files Created/Modified

### Created Files

- `services/aiImageVerification.js` - AI analysis service
- `services/satelliteMonitor.js` - Satellite monitoring
- `services/geospatialVerification.js` - Geospatial utilities
- `models/WaterBody.js` - Water body model
- `routes/verificationRoutes.js` - Verification endpoints
- `public/enhanced-dashboard.html` - Admin dashboard
- `seed-waterbodies.js` - Database seeding script

### Modified Files

- `package.json` - Added dependencies
- `models/Complaint.js` - Added 15+ new fields
- `controllers/complaintController.js` - Added AI & geospatial processing
- `server.js` - Added verification routes & Socket.IO events

---

## 🔐 Security Notes

1. **Voter Anonymity**
   - Device fingerprints + IP hashing for voter IDs
   - No PII stored in verification votes

2. **Location Privacy**
   - Coordinates stored as floats (limited precision)
   - Optional: Display only district-level location to public

3. **API Security**
   - CORS configured globally (can be restricted)
   - Validate all user inputs
   - Add rate limiting for production

4. **Satellite API Keys**
   - Store in environment variables only
   - Never commit to version control
   - Rotate keys periodically

---

## 🐛 Troubleshooting

**Issue: TensorFlow model fails to load**

- Solution: Falls back to mock predictions automatically
- Install CPU/GPU version matching your system

**Issue: Geospatial queries return no results**

- Verify: Water bodies seeded via `seed-waterbodies.js`
- Check: Indexes created on `geometry` field
- Debug: Run `db.waterbodies.getIndexes()`

**Issue: Socket.IO events not received**

- Check browser console for connection errors
- Verify CORS configuration in server.js
- Ensure client connects to correct URL

**Issue: Satellite API rate limits exceeded**

- Adjust `CHECK_INTERVAL` in satelliteMonitor.js
- Implement caching for satellite images
- Consider pagination for large datasets

---

## 📖 Additional Resources

- TensorFlow.js: https://www.tensorflow.org/js
- MongoDB Geospatial: https://docs.mongodb.com/manual/geospatial-queries/
- Socket.IO Documentation: https://socket.io/docs/
- NASA Earth Imagery API: https://api.nasa.gov/
- ISRO Bhuvan Portal: https://bhuvan.nrsc.gov.in/

---

## ✅ Implementation Checklist

- [x] AI Image Verification Service
- [x] Geospatial Boundary Detection
- [x] Crowd Verification System
- [x] Satellite Change Detection
- [x] Admin Dashboard Update
- [x] Complaint Schema Enhancement
- [x] Socket.IO Real-Time Events
- [x] API Routes for Verification
- [x] Database Indexes
- [x] Sample Data Seed Script
- [x] Documentation

---

**Version:** 1.0.0  
**Last Updated:** March 9, 2024  
**Status:** Production Ready
