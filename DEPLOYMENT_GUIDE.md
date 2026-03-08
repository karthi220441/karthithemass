# TN-WBAMS Deployment Guide - Railway.app

## ✅ Pre-Deployment Checklist

Files created:

- ✅ `.env` - Environment variables
- ✅ `Procfile` - Railway configuration
- ✅ `server.js` - Updated for production

---

## Step 1: Create MongoDB Atlas Account (FREE Database) - 5 min

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click **Sign Up** (free account)
3. Create an account with your email
4. Complete setup wizard:
   - Organization name: `TN-WBAMS`
   - Project name: `Production`
5. Click **Create Cluster**:
   - Choose **M0 Sandbox** (FREE)
   - Provider: AWS or Google Cloud
   - Region: Choose closest to India (Mumbai or Singapore)
   - Click **Create Cluster** (takes 2-3 minutes)
6. **Create Database User**:
   - Username: `tnwbams_user`
   - Password: Generate strong password (SAVE THIS!)
   - Click **Create Database User**
7. **Get Connection String**:
   - Click **Connect**
   - Choose **Connect your application**
   - Copy the connection string:
     ```
     mongodb+srv://tnwbams_user:<password>@cluster.mongodb.net/tnwbams?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password

---

## Step 2: Prepare Your Project

1. Open `.env` file in the project root
2. Update with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://tnwbams_user:YOUR_PASSWORD@cluster.mongodb.net/tnwbams?retryWrites=true&w=majority
   ```
3. Save the file

---

## Step 3: Deploy to Railway (EASY!)

### Option A: Deploy via GitHub (Recommended)

1. **Upload to GitHub:**
   - Create GitHub repository: https://github.com/new
   - Name: `tnwbams`
   - Push your code to GitHub (or upload files)
   - Command:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/tnwbams.git
     git push -u origin main
     ```

2. **Deploy on Railway:**
   - Go to: https://railway.app
   - Click **Sign Up** (free GitHub login)
   - Click **New Project**
   - Choose **Deploy from GitHub**
   - Select your `tnwbams` repository
   - Click **Deploy**
   - Railway auto-deploys! (2-3 minutes)

3. **Add Environment Variables:**
   - Go to Railway Dashboard
   - Click on your project
   - Click **Variables**
   - Add these variables:
     ```
     PORT=       → (Railway fills automatically)
     NODE_ENV=   → production
     MONGODB_URI → (paste your MongoDB connection string)
     ```
   - Click **Deploy**
   - Wait 2 minutes for deployment

### Option B: Deploy via File Upload (If No GitHub)

1. Go to: https://railway.app
2. Sign up with email
3. Click **New Project** → **Deploy from Repo**
4. Upload your files directly
5. Add environment variables
6. Click Deploy

---

## Step 4: Get Your Live URL

After deployment completes:

1. Go to Railway Dashboard
2. Click on your project
3. Click **Domains**
4. You'll see your live URL:

   ```
   https://your-project-name-prod.railway.app
   ```

5. **Test your app:**
   - Home: `https://your-project-name-prod.railway.app`
   - Report: `https://your-project-name-prod.railway.app/report.html`
   - View Complaints: `https://your-project-name-prod.railway.app/complaints.html`
   - Map: `https://your-project-name-prod.railway.app/map.html`

---

## Step 5: Share & Monitor

**Your app is now LIVE!** 🎉

### Share the link with:

- Government officials
- Water authorities
- Citizens
- NGOs

### Monitor your app:

- Railway Dashboard shows:
  - Logs (check for errors)
  - Usage (memory, CPU)
  - Deployments (deployment history)

---

## Troubleshooting

### "Deployment Failed"

- Check MongoDB Atlas connection string
- Make sure `.env` has correct password
- Check `Procfile` is in root directory

### "App sleeps after 15 min inactivity"

- Railway free tier: app sleeps, wakes on request (takes 30 sec)
- For production: upgrade to paid tier

### "Can't upload files"

- Create `.gitignore`:
  ```
  node_modules/
  .env
  uploads/
  ```

### "Connection refused"

- MongoDB Atlas: Add your IP to allowlist
- Go to MongoDB Atlas → Security → IP Whitelist
- Add: `0.0.0.0/0` (allow all - for testing only)

---

## File Structure (Ready to Deploy)

```
karthithemass/
├── .env                 ← MongoDB connection
├── Procfile             ← Railway config
├── server.js            ← Updated for production
├── package.json         ← Dependencies
├── models/
│   └── Complaint.js     ← Has lat/lng fields
├── controllers/
│   └── complaintController.js
├── routes/
│   └── complaintRoutes.js
├── public/
│   ├── index.html       ← Leaflet map
│   ├── report.html      ← Leaflet map
│   ├── complaint-detail.html
│   ├── complaints.html
│   ├── map.html
│   └── admin.html
└── uploads/             ← For images
```

---

## ESTIMATED TIME

- MongoDB Setup: **5 minutes**
- Railway Deploy: **5 minutes**
- Total: **10 minutes**

---

## Support Links

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Railway Docs: https://docs.railway.app/
- Node.js Deployment: https://nodejs.org/en/docs/guides/

---

## 🎯 You're Ready!

Once deployed, users can:
✅ Report water complaints with location
✅ View all complaints on interactive map
✅ See complaint details with exact location
✅ Government officials can track & update status

**Questions? Check Railway logs in dashboard!**

Live link format: `https://your-app-name.railway.app`
