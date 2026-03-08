# TN-WBAMS Complaint System

A full-stack web application for managing water body encroachment complaints in Tamil Nadu.

## Features

- Submit complaints with images
- View all submitted complaints
- Responsive design using Bootstrap
- Image upload and storage
- Real-time updates using Socket.io
- Location auto-complete for Tamil Nadu locations
- Admin panel for managing complaints
- Admin login (username: admin, password: admin123)
- Status updates with real-time notifications

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Socket.io
- **Frontend**: HTML, CSS, JavaScript, Bootstrap, Socket.io client
- **File Upload**: Multer

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start MongoDB
4. Run the server: `node server.js`
5. Open http://localhost:5000 in your browser

## API Endpoints

- `POST /api/complaints` - Create a new complaint
- `GET /api/complaints` - Get all complaints
- `PUT /api/complaints/:id/status` - Update complaint status (admin)
- `GET /uploads/:filename` - Access uploaded images

## Usage

1. **Public Access**: Visit the main page to submit complaints and view existing ones.
2. **Location Auto-complete**: Start typing in the location field to see suggestions for Tamil Nadu locations.
3. **Real-time Updates**: New complaints appear instantly without page refresh.
4. **Admin Panel**: Click "Admin Login" and use credentials (admin/admin123) to access the management panel.
5. **Admin Features**: Update complaint statuses, which are reflected in real-time for all users.

## Real-time Features

- New complaints are broadcasted instantly to all connected clients
- Status updates from admin are pushed to all users in real-time
- No need to refresh the page to see updates
