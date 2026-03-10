# How to Use Advanced Features in Your Website

Complete practical guide with code examples for integrating all 8 advanced modules into your TN-WBAMS website.

---

## 📋 Quick Start

### 1. Access the Enhanced Complaint Form

```
http://localhost:5000/enhanced-complaints.html
```

This page demonstrates how to use all features in a real complaint submission workflow.

### 2. Access Admin Dashboard

```
http://localhost:5000/enhanced-dashboard.html
```

View real-time verification results and analytics.

---

## 🚀 Feature Integration Guide

### Feature 1: AI Image Verification

#### How It Works in the Form

1. User uploads image by clicking or dragging file into upload zone
2. Image preview is displayed
3. "Analyzing image..." message appears
4. AI detects environmental hazards (garbage, construction, pollution)
5. Results show detected items and confidence score

#### Frontend Code Example

```javascript
// Handle image upload
function handleImageUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    // Show preview
    document.getElementById("imagePreview").innerHTML =
      `<img src="${e.target.result}" alt="Preview">`;

    // Trigger analysis
    analyzeImage(e.target.result);
  };
  reader.readAsDataURL(file);
}

// Backend will automatically analyze when complaint is submitted
```

#### API Integration

```javascript
// When form is submitted, image is sent to server:
const formData = new FormData();
formData.append("image", imageFile);
formData.append("title", complainTitle);
// ... other fields

const response = await fetch("/api/complaints", {
  method: "POST",
  body: formData,
});

// Server processes with TensorFlow.js automatically
// Results are returned and broadcast via Socket.IO
```

#### Real-Time Results

```javascript
// Listen for AI analysis completion
socket.on("aiDetectionComplete", (data) => {
  console.log("Detected labels:", data.labels);
  console.log("Confidence:", data.confidenceScore);
  console.log("Hazard detected:", data.environmentalHazardDetected);

  // Update UI with results
  updateAnalysisUI(data);
});
```

#### What It Shows

- ✓ Detected hazard types (garbage, construction, pollution, etc.)
- ✓ Confidence score (0-1)
- ✓ Number of objects detected
- ✓ Environmental hazard status

---

### Feature 2: Geospatial Location Verification

#### How It Works in the Form

1. User clicks "Get Current Location" button
2. Browser requests GPS permission
3. Coordinates are captured (latitude, longitude)
4. Location is displayed on form
5. System checks if location is within protected water body boundaries
6. Result shows which water body (if any) the complaint is in

#### Frontend Code Example

```javascript
// Get user's current location
document.getElementById("getLocationBtn").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Store for form submission
      formData.latitude = lat;
      formData.longitude = lng;

      // Display coordinates
      document.getElementById("latitudeValue").textContent = lat.toFixed(4);
      document.getElementById("longitudeValue").textContent = lng.toFixed(4);
    },
    (error) => {
      console.error("Location error:", error);
    },
  );
});
```

#### Checking Against Water Bodies

```javascript
// Verify if location is within protected water body
function verifyGeolocation(lat, lng) {
  // Sample: Cooum River boundaries
  const cooumLatMin = 13.0,
    cooumLatMax = 13.08;
  const cooumLngMin = 80.2,
    cooumLngMax = 80.25;

  if (
    lat >= cooumLatMin &&
    lat <= cooumLatMax &&
    lng >= cooumLngMin &&
    lng <= cooumLngMax
  ) {
    console.log("Location is within Cooum River!");
    // Show verified status
  }
}
```

#### Real-Time Verification Callback

```javascript
// Server broadcasts location verification result
socket.on("locationVerified", (data) => {
  if (data.verified) {
    console.log("Location verified in:", data.waterBodyName);
    showAlert(`Your complaint is in ${data.waterBodyName}`);
  } else {
    console.log("Location outside protected areas");
  }
});
```

#### Sample Protected Water Bodies

- **Cooum River, Chennai** - Lat: 13.0-13.08, Lng: 80.2-80.25
- **Adyar River, Chennai** - Lat: 12.95-13.05, Lng: 80.25-80.32
- **Palar River, Chengalpattu** - Lat: 12.7-12.85, Lng: 79.9-80.1
- **Pulicat Lake, Tiruvallur** - Lat: 13.15-13.35, Lng: 79.8-79.95

#### What It Shows

- ✓ Current GPS coordinates
- ✓ Whether location is within protected water body
- ✓ Name of water body (if verified)
- ✓ Distance to nearest water body

---

### Feature 3: Crowd Verification (Community Voting)

#### How It Works

1. After complaint is submitted, other users can vote
2. Users can "Confirm" or "Reject" the complaint
3. Credibility score is calculated: confirmed votes / total votes
4. If score ≥ 0.7 (70%), complaint is marked as crowdVerified

#### Submit Confirm Vote (API Call)

```javascript
// User confirms the complaint
async function confirmComplaint(complaintId) {
  const voterId = generateAnonymousVoterId(); // device fingerprint

  const response = await fetch(`/api/complaints/${complaintId}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterId }),
  });

  const result = await response.json();
  console.log("Confirmation recorded");
  console.log("Credibility score:", result.complaint.credibilityScore);
  console.log("Confirmed votes:", result.complaint.confirmedCount);
  console.log("Total votes:", result.complaint.totalVotes);
}
```

#### Submit Reject Vote (API Call)

```javascript
// User rejects the complaint
async function rejectComplaint(complaintId, reason) {
  const voterId = generateAnonymousVoterId();

  const response = await fetch(`/api/complaints/${complaintId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterId, reason }),
  });

  const result = await response.json();
  console.log("Rejection recorded");
  console.log("Credibility score:", result.complaint.credibilityScore);
  console.log("Rejected votes:", result.complaint.rejectedCount);
}
```

#### Get Credibility Details

```javascript
// Fetch detailed credibility information
async function getCredibilityScore(complaintId) {
  const response = await fetch(`/api/complaints/${complaintId}/credibility`);

  const data = await response.json();
  console.log(data.credibility);

  // Example output:
  // {
  //   credibilityScore: 0.833,
  //   credibilityStatus: "VERIFIED",
  //   totalVotes: 6,
  //   confirmedVotes: 5,
  //   rejectedVotes: 1,
  //   votingPercentages: { confirmedPercentage: 83.3, ... },
  //   votingTrend: "improving",
  //   recommendations: [...]
  // }
}
```

#### Real-Time Vote Updates

```javascript
// Listen for verification updates
socket.on("verificationUpdatedBroadcast", (data) => {
  console.log("New vote recorded");
  console.log("Updated credibility:", data.credibilityScore);

  // Update UI with new voting statistics
  updateVotingChart(data);
});
```

#### Generate Voter ID (Anonymous)

```javascript
// Create anonymous voter ID from device fingerprint + IP
function generateAnonymousVoterId() {
  const fingerprint =
    navigator.userAgent + navigator.language + screen.width + screen.height;

  // Hash the fingerprint
  const hash = btoa(fingerprint).substr(0, 16);

  return hash;
}
```

#### Display Voting UI Example

```html
<!-- Voting buttons on complaint detail page -->
<div class="voting-section">
  <button onclick="confirmComplaint('complaintId')">
    👍 I Confirm This ({{ confirmedCount }})
  </button>
  <button onclick="rejectComplaint('complaintId')">
    👎 I Reject This ({{ rejectedCount }})
  </button>

  <!-- Credibility Progress Bar -->
  <div class="credibility-meter">
    <div style="width: {{ credibilityScore * 100 }}%">
      Credibility: {{ (credibilityScore * 100).toFixed(0) }}%
    </div>
  </div>

  <!-- Verification Status -->
  <div class="status">
    {{ crowdVerified ? '✓ Verified by Community' : 'Pending Community Votes' }}
  </div>
</div>
```

#### What It Shows

- ✓ Total number of votes
- ✓ Confirmed vs rejected count
- ✓ Credibility percentage
- ✓ Crowd verified status (≥70%)
- ✓ Voting trend (improving/declining)

---

### Feature 4: Satellite Change Detection Alerts

#### How It Works

1. System monitors water body boundaries using satellite imagery
2. Checks periodically (every 24 hours by default)
3. Compares current image with historical image (30 days ago)
4. Detects changes (vegetation loss, water level, construction)
5. Generates alert if change > 10% threshold

#### Listen for Satellite Alerts

```javascript
// Subscribe to satellite monitoring alerts
socket.on("satelliteAlertGenerated", (alert) => {
  console.log("🛰️ Satellite Alert!");
  console.log("Water body:", alert.waterBodyName);
  console.log("Severity:", alert.severity); // low, medium, high, critical
  console.log("Change %:", alert.changePercentage);
  console.log("Detected changes:", alert.detectedChanges);

  // Show alert in dashboard
  displaySatelliteAlert(alert);
});
```

#### Alert Example Response

```javascript
{
    type: 'SATELLITE_ALERT',
    severity: 'high',
    waterBodyName: 'Cooum River',
    title: 'Satellite Alert: Changes detected at Cooum River',
    description: '18.5% change detected around Cooum River...',
    changePercentage: 18.5,
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
    recommendations: [
        'Send ground team for vegetation assessment',
        'Check water level gauge readings'
    ],
    suggestedActions: [
        {
            action: 'Review satellite imagery',
            priority: 'high',
            dueDate: '2024-03-10T10:30:00Z'
        }
    ]
}
```

#### Fetch Satellite Check History

```javascript
// Get satellite monitoring history for a water body
async function getSatelliteHistory(waterBodyId) {
  const response = await fetch(
    `/api/waterbodies/${waterBodyId}/satellite-history`,
  );

  const history = await response.json();

  // Display timeline of checks and alerts
  history.forEach((check) => {
    console.log(`${check.checkDate}: ${check.changePercentage}% change`);
  });
}
```

#### Configure Monitoring

```javascript
// In satelliteMonitor.js, adjust monitoring
const satelliteConfig = {
  CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  CHANGE_THRESHOLD: 10, // 10% threshold
};
```

#### What It Shows

- ✓ Water body with changes detected
- ✓ Percentage of change
- ✓ Types of changes (vegetation, water level, construction)
- ✓ Severity level (critical, high, medium, low)
- ✓ Recommended actions
- ✓ Historical tracking

---

### Feature 5: Real-Time Dashboard Updates

#### Access the Dashboard

```
http://localhost:5000/enhanced-dashboard.html
```

#### What's Displayed

**Panel 1: AI Image Detection**

- Total images analyzed
- Hazards detected count
- Average confidence score
- Detection categories breakdown

**Panel 2: Geospatial Verification**

- Protected water bodies count
- Verified locations count
- Verification rate %
- List of water bodies

**Panel 3: Crowd Verification**

- Total votes
- Average credibility score
- Crowd verified count
- Voting breakdown (confirmed vs rejected)

**Panel 4: Satellite Monitoring**

- Active monitoring count
- Alerts generated
- Last check timestamp
- Recent satellite alerts

**Panel 5: System Statistics**

- Total complaints
- Fully verified count
- Pending review count
- Multi-verification distribution

**Panel 6: Real-Time Events**

- Live event feed
- Last 10 events with timestamps

#### Socket.IO Events Received

```javascript
socket.on("newComplaint", (complaint) => {
  // New complaint submitted
  updateDashboardStats();
});

socket.on("aiDetectionComplete", (data) => {
  // AI analysis finished
  updateAIPanel(data);
});

socket.on("locationVerified", (data) => {
  // Geospatial verification complete
  updateLocationPanel(data);
});

socket.on("verificationUpdatedBroadcast", (data) => {
  // Crowd vote submitted
  updateCrowdPanel(data);
});

socket.on("satelliteAlertGenerated", (alert) => {
  // Satellite change detected
  updateSatellitePanel(alert);
});
```

---

## 🔧 Complete Implementation Example

### Step 1: User Submits Complaint with Image

```javascript
// User fills form and uploads image
async function submitComplaint() {
  const formData = new FormData();

  // Basic info
  formData.append("title", "Water Pollution in Cooum");
  formData.append("description", "Garbage floating in river");
  formData.append("district", "Chennai");
  formData.append("address", "Near Cooum Bridge");

  // Location (from GPS)
  formData.append("latitude", 13.0827);
  formData.append("longitude", 80.2707);

  // Image
  formData.append("image", imageFile);

  // Submit
  const response = await fetch("/api/complaints", {
    method: "POST",
    body: formData,
  });

  const complaint = await response.json();
  console.log("Complaint ID:", complaint._id);
}
```

### Step 2: Server Processes Automatically

**Backend Processing Chain:**

```
1. Complaint Created
   ↓
2. AI Analysis Starts (async)
   ├─ Load TensorFlow model
   ├─ Analyze image
   ├─ Detect objects
   └─ Emit 'aiDetectionComplete'
   ↓
3. Geospatial Verification Starts (async)
   ├─ Query water bodies
   ├─ Check intersection
   └─ Emit 'locationVerified'
   ↓
4. Socket.IO Broadcasts Events
   └─ Dashboard updates in real-time
```

### Step 3: Real-Time Updates on Dashboard

```javascript
// Dashboard receives updates
socket.on("aiDetectionComplete", (data) => {
  // Update AI panel
  aiPanel.labels = data.labels;
  aiPanel.confidence = data.confidenceScore;
  aiPanel.render();
});

socket.on("locationVerified", (data) => {
  // Update location panel
  locationPanel.waterBody = data.waterBodyName;
  locationPanel.render();
});
```

### Step 4: Community Votes

```javascript
// Users vote on complaint
await fetch("/api/complaints/:id/verify", {
  method: "POST",
  body: JSON.stringify({ voterId: "anonymousId" }),
});

// Real-time update
socket.on("verificationUpdatedBroadcast", (data) => {
  crowdPanel.credibility = data.credibilityScore;
  crowdPanel.votes = data.totalVotes;
  crowdPanel.render();
});
```

### Step 5: Satellite Monitoring (Continuous)

```javascript
// Every 24 hours, satellite monitoring runs
// If changes detected > 10%:
socket.emit("satelliteAlertGenerated", {
  waterBodyName: "Cooum River",
  severity: "high",
  changePercentage: 18.5,
});

// Dashboard shows alert
satellitePanel.showAlert(alert);
```

---

## 📱 Mobile-Friendly Features

### Responsive Design

- Form adapts to mobile screens
- Touch-friendly buttons and inputs
- Image preview scales on mobile
- Real-time updates work on mobile

### Location Access on Mobile

```javascript
// Works on iOS and Android
navigator.geolocation.getCurrentPosition((position) => {
  // Get GPS coordinates
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
});
```

---

## 🔐 Security & Privacy

### Anonymous Voting

```javascript
// Voter ID is NOT personally identifiable
const voterId = hash(userAgent + language + screenSize);

// Only hashed fingerprint is stored
// No names, emails, or tracking
```

### Location Privacy

```javascript
// Coordinates stored but not displayed to public
// Only district-level info shown in public view
```

### Image Security

```javascript
// Images uploaded to /uploads/ directory
// Access restricted to authenticated users
// Can be deleted after verification
```

---

## 🧪 Testing the Features

### Test AI Image Analysis

1. Go to enhanced-complaints.html
2. Upload an image
3. Watch "Analyzing..." message
4. See detected labels and confidence
5. Check admin dashboard for results

### Test Geolocation

1. Click "Get Current Location"
2. If in Chennai (within sample boundaries), see water body match
3. For other locations, see "Location outside protected areas"

### Test Community Voting

```javascript
// Manually call voting endpoint
fetch("/api/complaints/COMPLAINT_ID/verify", {
  method: "POST",
  body: JSON.stringify({ voterId: "voter1" }),
});

// Check credibility on dashboard
fetch("/api/complaints/COMPLAINT_ID/credibility").then((r) => r.json());
```

### Test Real-Time Events

```javascript
// Open dashboard and admin dashboard in separate windows
// Submit complaint in one
// Watch updates appear instantly in dashboard
```

---

## 📚 Full API Reference

### Create Complaint with Image

```
POST /api/complaints
Content-Type: multipart/form-data

Fields:
- title (required)
- description
- district
- latitude
- longitude
- address
- image (file)

Returns: Complaint object with _id, aiDetectionLabel, aiConfidenceScore, etc.
```

### Submit Verification Vote

```
POST /api/complaints/:id/verify
Content-Type: application/json

Body: { voterId: "string" }

Returns: {
  success: true,
  complaint: {
    confirmedCount,
    rejectedCount,
    credibilityScore,
    crowdVerified
  }
}
```

### Submit Rejection Vote

```
POST /api/complaints/:id/reject
Content-Type: application/json

Body: { voterId: "string", reason: "optional" }

Returns: Similar to verify endpoint
```

### Get Credibility Details

```
GET /api/complaints/:id/credibility

Returns: {
  credibilityScore: 0-1,
  credibilityStatus: "VERIFIED|PARTIALLY_VERIFIED|NOT_VERIFIED|NO_VOTES",
  votingBreakdown,
  votingPercentages,
  recentVotes,
  votingTrend,
  recommendations
}
```

### Get Complete Verification Details

```
GET /api/complaints/:id/verification-details

Returns: {
  aiVerification: { labels, confidenceScore, detected },
  geolocationVerification: { verified, waterBodyName, coordinates },
  crowdVerification: { credibilityScore, totalVotes },
  satelliteMonitoring: { alertActive, checksPerformed },
  overallVerificationScore: 0-1
}
```

---

## 🚀 Production Deployment Checklist

- [ ] Install dependencies: `npm install`
- [ ] Seed water bodies: `node seed-waterbodies.js`
- [ ] Configure MongoDB URI in .env
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS for production
- [ ] Restrict CORS to specific domains
- [ ] Add rate limiting to APIs
- [ ] Configure satellite API keys
- [ ] Set up monitoring and logging
- [ ] Test all features end-to-end
- [ ] Deploy to server

---

## ❓ Troubleshooting

**Q: AI analysis shows "mocked: true"**  
A: TensorFlow module failed to initialize. Falls back to mock model automatically. Install @tensorflow/tfjs-node.

**Q: Location always shows "Not set"**  
A: Browser needs geolocation permission. Check browser settings.

**Q: No real-time updates on dashboard**  
A: Socket.IO connection failed. Check CORS settings in server.js.

**Q: Credibility score not updating**  
A: Check that voterId is unique per device. Verify Socket.IO broadcasting.

---

## 📞 Support

For detailed documentation, see:

- [ADVANCED_FEATURES_GUIDE.md](ADVANCED_FEATURES_GUIDE.md) - Complete technical guide
- [enhanced-dashboard.html](enhanced-dashboard.html) - Real-time dashboard example
- [enhanced-complaints.html](enhanced-complaints.html) - Complete form example

---

**Version:** 1.0.0  
**Last Updated:** March 9, 2026
