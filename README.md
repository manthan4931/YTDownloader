# YouTube Downloader Web Application

A production-ready YouTube Downloader web application built with React, Node.js, Express, and yt-dlp. Download YouTube videos and audio in various qualities with a modern, responsive UI.

## Features

- **Video Downloads**: Download videos in 144p, 360p, 720p, and 1080p (if available)
- **Audio Extraction**: Extract high-quality MP3 audio from videos
- **Modern UI**: Beautiful dark theme with glassmorphism effects
- **Mobile Responsive**: Fully responsive design optimized for mobile devices
- **Real-time Info**: Fetch video title, thumbnail, duration, and available formats
- **Secure**: Input validation, rate limiting, and command injection prevention
- **Fast**: Streaming downloads without permanent storage
- **PWA Ready**: Progressive Web App support for mobile installation

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **yt-dlp** - YouTube downloader
- **FFmpeg** - Audio/video processing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting

## Project Structure

```
YTDownloader/
├── backend/
│   ├── routes/
│   │   └── downloadRoutes.js    # API route handlers
│   ├── server.js                # Express server setup
│   ├── package.json             # Backend dependencies
│   ├── .env.example             # Environment variables template
│   └── .gitignore               # Git ignore rules
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx       # Header component
│   │   │   ├── VideoInfo.jsx    # Video info display
│   │   │   └── DownloadOptions.jsx # Download buttons
│   │   ├── services/
│   │   │   └── api.js           # API service
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── public/
│   │   ├── manifest.json        # PWA manifest
│   │   └── vite.svg             # Icon
│   ├── index.html               # HTML template
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── postcss.config.js        # PostCSS configuration
│   ├── .env.example             # Environment variables template
│   └── .gitignore               # Git ignore rules
├── vercel.json                  # Vercel deployment config
├── render.yaml                  # Render deployment config
├── README.md                    # This file
└── DEPLOYMENT.md                # Deployment guide
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **FFmpeg** - Required for audio/video processing
- **yt-dlp** - Required for downloading YouTube content

### Installing FFmpeg

#### Windows
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
# Add to PATH environment variable
```

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

### Installing yt-dlp

#### Windows
```powershell
# Using pip
pip install yt-dlp

# Or download binary
# Download from https://github.com/yt-dlp/yt-dlp/releases
# Add to PATH environment variable
```

#### macOS
```bash
brew install yt-dlp
```

#### Linux
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd YTDownloader
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Default values should work for local development
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env if needed (defaults to localhost:5000)
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## API Endpoints

### GET /api/info?url=<youtube_url>
Fetches video information including title, thumbnail, duration, and available formats.

**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 180,
  "duration_string": "3:00",
  "uploader": "Channel Name",
  "view_count": 1000000,
  "formats": [
    {
      "format_id": "137",
      "ext": "mp4",
      "quality": "1080p",
      "height": 1080,
      "width": 1920
    }
  ],
  "audio_formats": [
    {
      "format_id": "140",
      "ext": "m4a",
      "abr": 128
    }
  ]
}
```

### GET /api/download/audio?url=<youtube_url>&format=mp3
Downloads audio in MP3 format. Streams the file directly to the client.

### GET /api/download/video?url=<youtube_url>&quality=720
Downloads video in specified quality (144, 360, 720, 1080). Streams the file directly to the client.

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Security Features

- **Input Validation**: All URLs are validated and sanitized
- **Command Injection Prevention**: Safe execution of yt-dlp commands
- **Rate Limiting**: Prevents abuse with configurable rate limits
- **CORS Protection**: Configurable CORS settings
- **Security Headers**: Helmet middleware for security headers
- **No Permanent Storage**: Files are streamed directly, not stored on disk

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- **Frontend**: Vercel
- **Backend**: Render or Railway

## Usage

1. Open the application in your browser
2. Paste a YouTube URL in the input field
3. Click "Fetch" to get video information
4. Select your preferred download option:
   - **Audio**: Choose MP3 quality
   - **Video**: Choose resolution (144p, 360p, 720p, 1080p)
5. Click the download button to start the download

## Mobile Usage

The application is fully responsive and works on mobile devices:
- Touch-friendly buttons
- Optimized layout for small screens
- PWA support for installation
- Share functionality for mobile browsers

## Troubleshooting

### FFmpeg not found
```bash
# Check installation
ffmpeg -version

# Reinstall if needed
# See Prerequisites section above
```

### yt-dlp not found
```bash
# Check installation
yt-dlp --version

# Reinstall if needed
# See Prerequisites section above
```

### CORS errors
- Check backend CORS_ORIGIN environment variable
- Ensure frontend API URL is correct
- Verify backend is running

### Download fails
- Check video is not private or age-restricted
- Verify yt-dlp is up to date: `yt-dlp -U`
- Check server logs for errors
- Ensure sufficient disk space (temporary)

## Legal Disclaimer

This tool is for personal use only. Please respect:
- YouTube's Terms of Service
- Copyright laws in your jurisdiction
- Content creators' rights

Do not use this tool to:
- Download copyrighted content without permission
- Distribute downloaded content
- Circumvent DRM or access controls

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review deployment guide
- Open an issue on GitHub

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube downloader library
- [FFmpeg](https://ffmpeg.org/) - Audio/video processing
- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Vite](https://vitejs.dev/) - Build tool
