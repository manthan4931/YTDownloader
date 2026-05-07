# Step-by-Step Deployment Guide

This guide will walk you through deploying your YouTube Downloader application to production.

---

## Prerequisites Before Deployment

1. **Push your code to GitHub**
   ```bash
   cd c:/Users/n/Downloads/YTDownloader/YTDownloader
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/manthan4931/YTDownloader.git
   git push -u origin main
   ```

2. **Ensure your repository is public** (or set up private repo access)

---

## PART 1: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Click "Sign Up" 
3. Sign up with GitHub (recommended)

### Step 2: Create New Web Service
1. After logging in, click "New +" button in the top right
2. Select "Web Service"

### Step 3: Connect Your Repository
1. Under "Connect a repository", search for `YTDownloader`
2. Click "Connect" next to your repository
3. Render will analyze your repository

### Step 4: Configure the Web Service

Fill in these settings:

**Name**: `yt-downloader-backend`

**Region**: Select a region closest to your users (e.g., Singapore, Oregon, Frankfurt)

**Branch**: `main`

**Runtime**: `Node`

**Build Command**: 
```
cd backend && npm install
```

**Start Command**: 
```
cd backend && npm start
```

**Instance Type**: Free (or paid for better performance)

### Step 5: Add Environment Variables

Scroll down to "Advanced" section, click "Add Environment Variable":

Add these variables one by one:

1. **Key**: `PORT` 
   **Value**: `10000`

2. **Key**: `NODE_ENV`
   **Value**: `production`

3. **Key**: `CORS_ORIGIN`
   **Value**: `*` (or your frontend URL after deploying)

4. **Key**: `RATE_LIMIT_WINDOW_MS`
   **Value**: `900000`

5. **Key**: `RATE_LIMIT_MAX_REQUESTS`
   **Value**: `100`

### Step 6: Deploy
1. Click "Create Web Service" at the bottom
2. Render will start deploying your backend
3. Wait for deployment to complete (usually 2-5 minutes)
4. You'll see a "Live" status when it's done
5. Copy your backend URL (e.g., `https://yt-downloader-backend.onrender.com`)

### Step 7: Install FFmpeg and yt-dlp on Render

**IMPORTANT**: You must install these after deployment:

1. Go to your deployed service dashboard on Render
2. Click the "Shell" tab (or "SSH" in some versions)
3. Run these commands one by one:

```bash
# Update package list
sudo apt-get update

# Install FFmpeg
sudo apt-get install -y ffmpeg

# Verify FFmpeg installation
ffmpeg -version

# Install yt-dlp
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Verify yt-dlp installation
yt-dlp --version
```

4. Close the shell

### Step 8: Test Backend
1. Open your browser
2. Visit: `https://your-backend-url.onrender.com/health`
3. You should see: `{"status":"ok","message":"YouTube Downloader API is running"}`
4. If not, check the "Logs" tab in Render dashboard for errors

---

## PART 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended)

### Step 2: Update Frontend Environment Variable

Before deploying, update your frontend .env file with your backend URL:

1. Open `frontend/.env` in your code
2. Change the backend URL to your Render URL:
   ```
   VITE_API_URL=https://yt-downloader-backend.onrender.com
   ```
3. Save the file
4. Commit and push to GitHub:
   ```bash
   git add frontend/.env
   git commit -m "Update backend URL"
   git push
   ```

### Step 3: Deploy to Vercel

**Option A: Deploy from Vercel Dashboard (Easier)**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Click "Import" next to your `YTDownloader` repository
4. Configure the project:

**Project Name**: `yt-downloader-frontend`

**Framework Preset**: `Vite`

**Root Directory**: `frontend`

**Build Command**: `npm run build`

**Output Directory**: `dist`

**Install Command**: `npm install`

5. Click "Add Environment Variable":
   - **Name**: `VITE_API_URL`
   - **Value**: `https://yt-downloader-backend.onrender.com` (your backend URL)
   - Click "Save"

6. Click "Deploy"
7. Wait for deployment to complete (usually 1-2 minutes)
8. Copy your frontend URL (e.g., `https://yt-downloader-frontend.vercel.app`)

**Option B: Deploy using Vercel CLI**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd frontend
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? → `Y`
   - Link to existing project? → `N`
   - Project name → `yt-downloader-frontend`
   - Directory → `./`
   - Override settings? → `N`

5. Add environment variable:
   ```bash
   vercel env add VITE_API_URL production
   ```
   - Enter your backend URL when prompted
   - Select `production`

6. Redeploy:
   ```bash
   vercel --prod
   ```

### Step 4: Test Frontend
1. Open your browser
2. Visit your Vercel URL
3. Try pasting a YouTube URL and clicking "Fetch"
4. Verify it fetches video information correctly

---

## PART 3: Update CORS (Optional but Recommended)

After both deployments, update your backend CORS to only allow your frontend:

1. Go to Render dashboard → Your backend service
2. Settings → Environment Variables
3. Edit `CORS_ORIGIN`:
   - Change from `*` to your Vercel URL
   - Example: `https://yt-downloader-frontend.vercel.app`
4. Save and redeploy (Render will auto-redeploy)

---

## PART 4: Verify Everything Works

1. **Test Backend Health**:
   - Visit: `https://your-backend-url.onrender.com/health`
   - Should return: `{"status":"ok","message":"YouTube Downloader API is running"}`

2. **Test Video Info Fetch**:
   - Visit: `https://your-backend-url.onrender.com/api/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Should return video information JSON

3. **Test Frontend**:
   - Visit your Vercel URL
   - Paste a YouTube URL
   - Click "Fetch"
   - Should show video thumbnail and information

4. **Test Download** (try one):
   - Click an audio or video download button
   - Verify download starts

---

## Troubleshooting

### Backend Issues

**FFmpeg/yt-dlp not working**:
- Make sure you installed them in the Render shell (Step 7)
- Check Render logs for errors
- Redeploy after installing

**CORS errors**:
- Check CORS_ORIGIN environment variable
- Ensure frontend URL is correct
- Try setting CORS_ORIGIN to `*` temporarily

**Port issues**:
- Render automatically assigns ports
- Your backend URL will include the correct port
- Don't hardcode port 5000 in frontend

### Frontend Issues

**API connection errors**:
- Verify VITE_API_URL is set correctly
- Check that backend is deployed and running
- Check browser console for errors

**Build failures**:
- Ensure all dependencies are in package.json
- Check Vercel deployment logs
- Try clearing cache and redeploying

### Mobile Testing

**Test on mobile**:
1. Open your Vercel URL on your phone
2. Try fetching a video
3. Try downloading audio (small file first)
4. Try downloading video (small/short video first)

**Mobile download issues**:
- iOS: Check Files app for downloads
- Android: Check Downloads folder
- Some browsers may block large downloads
- Try different browsers if needed

---

## Summary

- **Backend**: Deployed on Render with FFmpeg and yt-dlp installed
- **Frontend**: Deployed on Vercel with backend URL configured
- **Both**: Free tiers available, upgrade if needed
- **Mobile**: Fully responsive, downloads work on mobile browsers

Your application is now live and accessible to users worldwide!
