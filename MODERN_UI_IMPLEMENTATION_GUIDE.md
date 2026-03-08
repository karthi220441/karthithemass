# TN-WBAMS Modern UI Design - Implementation Guide

## 📋 Overview

This guide provides copy-paste HTML/CSS snippets to upgrade your TN-WBAMS website to a modern, professional government-style interface.

## 🎨 Color Theme

```css
:root {
  --primary: #0f4c75; /* Deep Blue - Government/Authority */
  --secondary: #3282b8; /* Medium Blue - Buttons/Highlights */
  --success: #22c55e; /* Green - Resolved cases */
  --warning: #f59e0b; /* Amber - In Progress */
  --danger: #ef4444; /* Red - Pending/Alerts */
  --light: #f8fafc; /* Light Gray - Backgrounds */
  --dark: #1a202c; /* Dark Gray - Text */
  --border: #e2e8f0; /* Border color */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}
```

---

## 1️⃣ HOMEPAGE DASHBOARD

### Dashboard Statistics Cards

```html
<!-- Statistics Grid -->
<section class="dashboard-stats">
  <div class="container">
    <div class="section-title">System Status Dashboard</div>
    <div class="stat-grid">
      <div class="stat-card accent-danger">
        <div class="stat-content">
          <div
            class="stat-icon"
            style="background: rgba(239, 68, 68, 0.1); color: #ef4444;"
          >
            <i class="fas fa-flag"></i>
          </div>
          <div class="stat-number" id="totalComplaints">0</div>
          <div class="stat-title">Total Complaints</div>
          <div class="stat-trend">Updated now</div>
        </div>
      </div>

      <div class="stat-card accent-warning">
        <div class="stat-content">
          <div
            class="stat-icon"
            style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;"
          >
            <i class="fas fa-hourglass"></i>
          </div>
          <div class="stat-number" id="pendingComplaints">0</div>
          <div class="stat-title">Pending Cases</div>
          <div class="stat-trend">Awaiting verification</div>
        </div>
      </div>

      <div class="stat-card accent-warning">
        <div class="stat-content">
          <div
            class="stat-icon"
            style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;"
          >
            <i class="fas fa-spinner"></i>
          </div>
          <div class="stat-number" id="inProgressComplaints">0</div>
          <div class="stat-title">Under Investigation</div>
          <div class="stat-trend">Field inspections ongoing</div>
        </div>
      </div>

      <div class="stat-card accent-success">
        <div class="stat-content">
          <div
            class="stat-icon"
            style="background: rgba(34, 197, 94, 0.1); color: #22c55e;"
          >
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-number" id="resolvedComplaints">0</div>
          <div class="stat-title">Resolved Cases</div>
          <div class="stat-trend">↑ Resolution rate</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### CSS for Statistics Cards

```css
.dashboard-stats {
  padding: 40px 0;
  margin: 20px 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 5px solid var(--secondary);
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: "";
  position: absolute;
  top: 0;
  right: -50px;
  width: 120px;
  height: 120px;
  background: rgba(15, 76, 117, 0.05);
  border-radius: 50%;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 5px;
  color: var(--dark);
}

.stat-title {
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 500;
}

.stat-trend {
  font-size: 0.85rem;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  color: var(--success);
}
```

---

## 2️⃣ COMPLAINTS PAGE - Modern Cards

### Complaint Card Component

```html
<div class="complaint-grid">
  <div class="complaint-card">
    <!-- Image Section -->
    <div class="complaint-image">
      <i
        class="fas fa-image"
        style="font-size: 3rem; color: var(--primary); opacity: 0.5;"
      ></i>
    </div>

    <!-- Status Badge -->
    <div style="position: relative;">
      <span class="status-badge status-in-progress">IN PROGRESS</span>
    </div>

    <!-- Card Body -->
    <div class="complaint-body">
      <h5 class="complaint-title">Lake Encroachment at Veli Lake</h5>
      <p class="complaint-desc">
        Unauthorized construction activity detected on the eastern shore
        affecting water quality...
      </p>

      <!-- Metadata -->
      <div class="complaint-meta">
        <div class="complaint-meta-item">
          <i class="fas fa-map-marker" style="color: var(--danger);"></i>
          <span>Chennai</span>
        </div>
        <div class="complaint-meta-item">
          <i class="fas fa-calendar" style="color: var(--secondary);"></i>
          <span>Mar 5, 2026</span>
        </div>
      </div>

      <!-- Action Button -->
      <div class="complaint-footer">
        <button class="btn-view" onclick="viewComplaint(this)">
          <i class="fas fa-eye me-2"></i>View Details
        </button>
      </div>
    </div>
  </div>
</div>
```

### Complaint Card Styles

```css
.complaint-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.complaint-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-top: 4px solid var(--secondary);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.complaint-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.complaint-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #bbe1fa, #c5d9f1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
}

.status-pending {
  background: #ef4444;
}
.status-in-progress {
  background: #f59e0b;
}
.status-resolved {
  background: #22c55e;
}

.complaint-body {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.complaint-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 8px;
}

.complaint-desc {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 15px;
  flex-grow: 1;
}

.complaint-meta {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px solid var(--border);
  font-size: 0.85rem;
  margin-bottom: 15px;
}

.complaint-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
}

.btn-view {
  background: var(--secondary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-view:hover {
  background: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

---

## 3️⃣ INTERACTIVE MAP - Leaflet Integration

### Map HTML

```html
<div class="filters-section">
  <h5><i class="fas fa-filter me-2"></i>Filter Complaints</h5>
  <div class="row g-3 align-items-end">
    <div class="col-md-3">
      <label class="form-label small text-muted">District</label>
      <select class="form-select" id="districtFilter">
        <option value="">All Districts</option>
        <option value="Chennai">Chennai</option>
        <option value="Coimbatore">Coimbatore</option>
        <!-- Add more districts -->
      </select>
    </div>
    <div class="col-md-3">
      <label class="form-label small text-muted">Status</label>
      <select class="form-select" id="statusFilter">
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
      </select>
    </div>
    <div class="col-md-3">
      <button class="btn btn-apply w-100" id="filterBtn">
        <i class="fas fa-search me-2"></i>Apply Filters
      </button>
    </div>
  </div>
</div>

<div class="map-container">
  <div id="leaflet-map"></div>

  <!-- Legend -->
  <div class="legend d-none d-md-block">
    <h6>Status Legend</h6>
    <div class="legend-item">
      <div class="legend-dot pending"></div>
      <span class="legend-label">Pending</span>
      <span class="legend-count" id="countPending">0</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot progress"></div>
      <span class="legend-label">In Progress</span>
      <span class="legend-count" id="countProgress">0</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot resolved"></div>
      <span class="legend-label">Resolved</span>
      <span class="legend-count" id="countResolved">0</span>
    </div>
  </div>
</div>
```

### Map JavaScript

```javascript
// Include these CDNs in HTML
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
// <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>

let map;
let markers = {};
let allComplaints = [];

function initializeMap() {
  map = L.map("leaflet-map").setView([11.1271, 78.6569], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);

  loadComplaints();
}

function getMarkerColor(status) {
  switch (status) {
    case "Resolved":
      return "#22c55e"; // Green
    case "In Progress":
      return "#f59e0b"; // Amber
    case "Pending":
      return "#ef4444"; // Red
    default:
      return "#3282B8"; // Blue
  }
}

async function loadComplaints() {
  try {
    const response = await fetch("/api/complaints");
    allComplaints = await response.json();
    updateMarkers(allComplaints);
  } catch (error) {
    console.error("Error loading complaints:", error);
  }
}

function updateMarkers(complaints) {
  Object.keys(markers).forEach((id) => map.removeLayer(markers[id]));
  markers = {};

  let pending = 0,
    progress = 0,
    resolved = 0;

  complaints.forEach((complaint) => {
    if (complaint.latitude && complaint.longitude) {
      const color = getMarkerColor(complaint.status);
      const marker = L.circleMarker([complaint.latitude, complaint.longitude], {
        radius: 8,
        fillColor: color,
        color: "white",
        weight: 2,
        fillOpacity: 0.8,
      })
        .bindPopup(
          `
                <div>
                    <h6>${complaint.title}</h6>
                    <p>${complaint.description?.substring(0, 80) || ""}...</p>
                    <small>District: ${complaint.district}</small><br>
                    <small>Status: <strong>${complaint.status}</strong></small><br>
                    <a href="complaint-detail.html?id=${complaint._id}">View Details →</a>
                </div>
            `,
        )
        .addTo(map);

      markers[complaint._id] = marker;

      if (complaint.status === "Pending") pending++;
      else if (complaint.status === "In Progress") progress++;
      else if (complaint.status === "Resolved") resolved++;
    }
  });

  document.getElementById("countPending").textContent = pending;
  document.getElementById("countProgress").textContent = progress;
  document.getElementById("countResolved").textContent = resolved;
}

document.getElementById("filterBtn").addEventListener("click", () => {
  const district = document.getElementById("districtFilter").value;
  const status = document.getElementById("statusFilter").value;

  let filtered = allComplaints;
  if (district) filtered = filtered.filter((c) => c.district === district);
  if (status) filtered = filtered.filter((c) => c.status === status);

  updateMarkers(filtered);
});

window.addEventListener("load", initializeMap);
```

---

## 4️⃣ COMPLAINT TIMELINE - Tracking Progress

```html
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-marker" style="background: var(--success);">
      <i class="fas fa-check"></i>
    </div>
    <div class="timeline-content">
      <div class="timeline-title">Complaint Submitted</div>
      <div class="timeline-date">March 5, 2026 - 10:30 AM</div>
      <p>Complaint registered with all required documentation</p>
    </div>
  </div>

  <div class="timeline-item">
    <div class="timeline-marker" style="background: var(--warning);">
      <i class="fas fa-play"></i>
    </div>
    <div class="timeline-content">
      <div class="timeline-title">Under Verification</div>
      <div class="timeline-date">March 6, 2026 - 2:45 PM</div>
      <p>Initial inspection completed. Encroachment confirmed.</p>
    </div>
  </div>

  <div class="timeline-item">
    <div class="timeline-marker" style="background: #d1d5db;">
      <i class="fas fa-wrench"></i>
    </div>
    <div class="timeline-content">
      <div class="timeline-title">Action Scheduled</div>
      <div class="timeline-date">Expected: March 15, 2026</div>
      <p>Removal of illegal structures scheduled</p>
    </div>
  </div>
</div>
```

### Timeline Styles

```css
.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-item {
  display: flex;
  margin-bottom: 30px;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  background: var(--secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  margin-right: 20px;
  flex-shrink: 0;
}

.timeline-content {
  background: var(--light);
  padding: 20px;
  border-radius: 8px;
  flex: 1;
  border-left: 3px solid var(--secondary);
}

.timeline-title {
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 5px;
}

.timeline-date {
  font-size: 0.85rem;
  color: #64748b;
}
```

---

## 5️⃣ Authority Dashboard Enhancement

### Dashboard HTML Structure

```html
<div id="adminPanel">
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>
        <i class="fas fa-tachometer-alt" style="color: var(--primary);"></i>
        Authority Dashboard
      </h1>
      <button
        id="logoutBtn"
        class="btn"
        style="background: #ef4444; color: white;"
      >
        <i class="fas fa-sign-out-alt me-2"></i>Logout
      </button>
    </div>

    <!-- Dashboard Stats -->
    <div class="stat-grid">
      <div class="stat-card">
        <div
          class="stat-icon"
          style="background: rgba(239, 68, 68, 0.1); color: #ef4444;"
        >
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-number" id="totalComplaints">0</div>
        <div class="stat-title">Total Complaints</div>
      </div>
      <!-- More stat cards -->
    </div>

    <!-- Complaints Table -->
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Title</th>
            <th>District</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="complaintsTable">
          <!-- Rows populated by JavaScript -->
        </tbody>
      </table>
    </div>
  </div>
</div>
```

---

## ✅ Quick Implementation Steps

1. **Update Color Variables** - Replace color codes in `:root` CSS
2. **Copy Dashboard Stats HTML** - Add to `index.html`
3. **Implement Complaint Cards** - Replace card structures in `complaints.html`
4. **Add Leaflet Map** - Include map.html updates
5. **Add Timeline Component** - Use in `complaint-detail.html`
6. **Update Authority Dashboard** - Enhance `admin.html` styling
7. **Test Responsive Design** - Check all breakpoints
8. **Optimize Performance** - Minify CSS/JS

---

## 🎓 Resources

- **Modern CSS**: Use CSS Grid, Flexbox, and variables
- **Leaflet.js**: Free mapping library (no API key needed)
- **Bootstrap 5**: For responsive grid system
- **Font Awesome 6**: For beautiful icons

---

Visit `UI_DESIGN_GUIDE.html` in your public folder to see all components in action!
