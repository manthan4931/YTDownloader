# Deployment Guide

This guide will help you deploy the YouTube Downloader application to production.

## Prerequisites

Before deploying, ensure you have:
- FFmpeg installed on your server
- yt-dlp installed on your server
- Node.js (v18 or higher)
- npm or yarn

## Backend Deployment (Render or Railway)

### Option 1: Deploy to Render

1. **Create a Render Account**
   - Go to [render.com](https://render.com) and sign up

2. **Prepare Your Repository**
   - Push your code to GitHub/GitLab
   - Ensure `render.yaml` is in the root directory

3. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository
   - Render will automatically detect the `render.yaml` configuration
   - Click "Create Web Service"

4. **Install FFmpeg and yt-dlp**
   - After deployment, go to your service dashboard
   - Click "Shell" to access the server
   - Run the following commands:
   ```bash
   # Install FFmpeg
   sudo apt-get update
   sudo apt-get install -y ffmpeg
   
   # Install yt-dlp
   sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
   sudo chmod a+rx /usr/local/bin/yt-dlp
   ```

5. **Configure Environment Variables**
   - Go to your service settings → Environment
   - Add the following variables:
     ```
     PORT=10000
     NODE_ENV=production
     CORS_ORIGIN=*
     RATE_LIMIT_WINDOW_MS=900000
     RATE_LIMIT_MAX_REQUESTS=100
     ```

6. **Redeploy**
   - After installing dependencies, click "Manual Deploy" → "Clear build cache & deploy"

### Option 2: Deploy to Railway

1. **Create a Railway Account**
   - Go to [railway.app](https://railway.app) and sign up

2. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **Deploy from Your Project**
   ```bash
   cd /path/to/YTDownloader
   railway init
   railway up
   ```

4. **Install FFmpeg and yt-dlp**
   - Railway uses a Docker-based environment
   - Create a `Dockerfile` in the backend directory:
   ```dockerfile
   FROM node:18-alpine
   
   # Install FFmpeg
   RUN apk add --no-cache ffmpeg
   
   # Install yt-dlp
   RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
   RUN chmod a+rx /usr/local/bin/yt-dlp
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

5. **Configure Environment Variables**
   - In Railway dashboard, add the same environment variables as Render

6. **Deploy**
   - Railway will automatically deploy your application

## Frontend Deployment (Vercel)

### Deploy to Vercel

1. **Create a Vercel Account**
   - Go to [vercel.com](https://vercel.com) and sign up

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   ```

3. **Update Environment Variable**
   - In `frontend/.env`, update `VITE_API_URL` to your deployed backend URL:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

5. **Configure Production**
   - Follow the prompts to configure your project
   - Set the root directory to `frontend`
   - Set the build command to `npm run build`
   - Set the output directory to `dist`

6. **Add Custom Domain (Optional)**
   - Go to Vercel dashboard → Settings → Domains
   - Add your custom domain

### Alternative: Deploy from Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable: `VITE_API_URL` = your backend URL
6. Click "Deploy"

## Post-Deployment Checklist

- [ ] Backend is accessible at `/health` endpoint
- [ ] Frontend can connect to backend API
- [ ] FFmpeg is installed and working on backend
- [ ] yt-dlp is installed and working on backend
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Environment variables are set correctly
- [ ] Test downloading a video
- [ ] Test downloading audio
- [ ] Test on mobile devices

## Troubleshooting

### Backend Issues

**FFmpeg not found:**
```bash
# Check if FFmpeg is installed
ffmpeg -version

# If not installed, run:
sudo apt-get install -y ffmpeg  # Linux
brew install ffmpeg              # macOS
```

**yt-dlp not found:**
```bash
# Check if yt-dlp is installed
yt-dlp --version

# If not installed, run:
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

**CORS errors:**
- Ensure `CORS_ORIGIN` environment variable includes your frontend URL
- Check that the frontend is using the correct backend URL

### Frontend Issues

**API connection errors:**
- Verify `VITE_API_URL` is set correctly in `.env`
- Check that backend is running and accessible
- Ensure CORS is configured correctly on backend

**Build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that all dependencies are in package.json

## Monitoring

### Backend Monitoring

- Use Render's built-in metrics and logs
- Monitor CPU and memory usage
- Check rate limiting logs
- Monitor disk usage (files should not persist)

### Frontend Monitoring

- Use Vercel Analytics
- Monitor build times
- Check deployment logs
- Monitor error rates

## Scaling

### Backend Scaling

- Render: Upgrade to paid plan for more resources
- Railway: Automatically scales based on usage
- Consider using a CDN for static assets

### Frontend Scaling

- Vercel automatically handles scaling
- Edge caching is enabled by default
- No additional configuration needed
