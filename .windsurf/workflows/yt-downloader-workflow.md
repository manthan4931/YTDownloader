---
description: Complete YTDownloader Project Workflow - Step by Step Guide
---

# YTDownloader Project - Complete Workflow Documentation

## Overview
This document provides a detailed step-by-step workflow of the YouTube Downloader application, covering all functions, their connections, and the complete data flow from user interaction to backend processing.

---

## Project Structure

```
YTDownloader/
├── backend/
│   ├── server.js                      # Express server entry point
│   ├── routes/
│   │   └── downloadRoutes.js          # API route handlers
│   └── package.json                   # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx             # Header component
│   │   │   ├── VideoInfo.jsx          # Video info display component
│   │   │   └── DownloadOptions.jsx    # Download buttons component
│   │   ├── services/
│   │   │   └── api.js                 # API service layer
│   │   ├── App.jsx                    # Main application component
│   │   ├── main.jsx                   # React entry point
│   │   └── index.css                  # Global styles
│   ├── index.html                     # HTML template
│   └── package.json                   # Frontend dependencies
└── README.md                          # Project documentation
```

---

## Backend Architecture

### 1. `backend/server.js` - Server Initialization

**Functions:**
- `app.listen(PORT)` - Starts the Express server on configured port
- Middleware setup functions (implicit):
  - `helmet()` - Security headers configuration
  - `cors()` - Cross-origin resource sharing
  - `rateLimit()` - Request rate limiting
  - `express.json()` - JSON body parsing

**Route Registrations:**
- `GET /health` - Health check endpoint
- `GET /api/info` - Fetches video information → `fetchVideoInfo()`
- `GET /api/download/audio` - Downloads audio → `downloadAudio()`
- `GET /api/download/video` - Downloads video → `downloadVideo()`

**Error Handlers:**
- Global error middleware (line 47-53)
- 404 handler (line 56-58)

**Environment Variables:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode
- `CORS_ORIGIN` - Allowed CORS origins
- `RATE_LIMIT_WINDOW_MS` - Rate limit window
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

---

### 2. `backend/routes/downloadRoutes.js` - Route Handlers

#### Helper Functions:

**`isValidYouTubeUrl(url)`** (line 6-14)
- **Purpose:** Validates if a URL is a valid YouTube URL
- **Parameters:** `url` (string)
- **Returns:** `boolean`
- **Valid Hosts:** www.youtube.com, youtube.com, m.youtube.com, youtu.be
- **Used by:** `fetchVideoInfo()`, `downloadAudio()`, `downloadVideo()`

**`sanitizeUrl(url)`** (line 17-20)
- **Purpose:** Removes shell metacharacters to prevent command injection
- **Parameters:** `url` (string)
- **Returns:** Sanitized URL string
- **Removes:** `; & | ` $ ( ) < >`
- **Used by:** `fetchVideoInfo()`, `downloadAudio()`, `downloadVideo()`

**`executeYtDlp(args)`** (line 23-53)
- **Purpose:** Executes yt-dlp command safely using child_process.spawn
- **Parameters:** `args` (array of command arguments)
- **Returns:** `Promise<string>` - stdout output
- **Process:** Spawns Python with yt-dlp module, captures stdout/stderr
- **Used by:** `fetchVideoInfo()`

#### Route Handler Functions:

**`fetchVideoInfo(req, res)`** (line 56-127)
- **Endpoint:** `GET /api/info?url=<youtube_url>`
- **Purpose:** Fetches video metadata from YouTube
- **Parameters from Query:** `url`
- **Process Flow:**
  1. Validates URL presence (line 60-62)
  2. Validates YouTube URL format (line 64-66)
  3. Sanitizes URL (line 68)
  4. Constructs yt-dlp arguments (line 70-75):
     - `--dump-json` - Output as JSON
     - `--no-playlist` - Single video only
     - `--no-warnings` - Suppress warnings
  5. Executes yt-dlp via `executeYtDlp()` (line 77)
  6. Parses JSON output (line 78)
  7. Extracts and formats video information (line 81-111):
     - `title`, `thumbnail`, `duration`, `duration_string`
     - `uploader`, `view_count`
     - `formats` - Video formats (filtered for mp4 with video codec)
     - `audio_formats` - Audio formats (m4a/webm)
  8. Returns JSON response (line 113)
- **Error Handling:**
  - 400: Missing URL or invalid URL
  - 404: Private/unavailable video
  - 403: Age-restricted video
  - 500: Server error

**`downloadAudio(req, res)`** (line 130-196)
- **Endpoint:** `GET /api/download/audio?url=<youtube_url>&format=mp3`
- **Purpose:** Downloads audio from YouTube video
- **Parameters from Query:** `url`, `format` (default: 'mp3')
- **Process Flow:**
  1. Validates URL presence (line 134-136)
  2. Validates YouTube URL format (line 138-140)
  3. Sanitizes URL (line 142)
  4. Sets response headers (line 145-146):
     - `Content-Type: audio/mpeg`
     - `Content-Disposition: attachment`
  5. Constructs yt-dlp arguments (line 148-157):
     - `-f bestaudio/best` - Best audio quality
     - `--extract-audio` - Extract audio only
     - `--audio-format <format>` - Output format
     - `--audio-quality 0` - Best quality
     - `-o -` - Output to stdout
  6. Spawns yt-dlp process (line 159-162)
  7. Pipes stdout to response (line 164)
  8. Handles process errors (line 166-184)
  9. Kills process on client disconnect (line 186-188)
- **Error Handling:**
  - 400: Missing URL or invalid URL
  - 500: Download failed

**`downloadVideo(req, res)`** (line 199-266)
- **Endpoint:** `GET /api/download/video?url=<youtube_url>&quality=720`
- **Purpose:** Downloads video from YouTube
- **Parameters from Query:** `url`, `quality` (default: '720')
- **Process Flow:**
  1. Validates URL presence (line 203-205)
  2. Validates YouTube URL format (line 207-209)
  3. Sanitizes URL (line 211)
  4. Sets response headers (line 214-215):
     - `Content-Type: video/mp4`
     - `Content-Disposition: attachment`
  5. Constructs format string (line 218):
     - `bestvideo[height<=<quality>]+bestaudio/best[height<=<quality>]`
  6. Constructs yt-dlp arguments (line 220-227):
     - `-f <formatString>` - Format selection
     - `--merge-output-format mp4` - Merge to MP4
     - `-o -` - Output to stdout
  7. Spawns yt-dlp process (line 229-232)
  8. Pipes stdout to response (line 234)
  9. Handles process errors (line 236-254)
  10. Kills process on client disconnect (line 256-258)
- **Error Handling:**
  - 400: Missing URL or invalid URL
  - 500: Download failed

---

## Frontend Architecture

### 1. `frontend/src/App.jsx` - Main Application Component

**State Variables:**
- `url` (string) - YouTube URL input value
- `videoInfo` (object/null) - Video metadata
- `loading` (boolean) - Loading state for fetch operation
- `downloading` (string/null) - Download operation state

**Functions:**

**`isValidYouTubeUrl(url)`** (line 15-18)
- **Purpose:** Client-side URL validation
- **Parameters:** `url` (string)
- **Returns:** `boolean`
- **Pattern:** `/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/`
- **Used by:** `handleFetchInfo()`, `handlePaste()`

**`handleFetchInfo()`** (line 20-44)
- **Purpose:** Fetches video information from backend
- **Process Flow:**
  1. Validates URL is not empty (line 21-24)
  2. Validates URL format (line 26-29)
  3. Sets loading state to true (line 31)
  4. Clears previous video info (line 32)
  5. Calls `fetchVideoInfo(url)` from api.js (line 35)
  6. Updates videoInfo state with response (line 36)
  7. Shows success toast (line 37)
  8. Handles errors with toast (line 38-40)
  9. Sets loading state to false (line 42)
- **Connected to:** `api.fetchVideoInfo()`

**`handleDownloadAudio(format = 'mp3')`** (line 46-58)
- **Purpose:** Initiates audio download
- **Parameters:** `format` (string, default: 'mp3')
- **Process Flow:**
  1. Checks if videoInfo exists (line 47)
  2. Sets downloading state to 'audio' (line 49)
  3. Calls `downloadAudio(url, format)` from api.js (line 51)
  4. Shows success toast (line 52)
  5. Handles errors with toast (line 53-55)
  6. Sets downloading state to null (line 56)
- **Connected to:** `api.downloadAudio()`

**`handleDownloadVideo(quality)`** (line 60-72)
- **Purpose:** Initiates video download
- **Parameters:** `quality` (string, e.g., '720')
- **Process Flow:**
  1. Checks if videoInfo exists (line 61)
  2. Sets downloading state to `video-{quality}` (line 63)
  3. Calls `downloadVideo(url, quality)` from api.js (line 65)
  4. Shows success toast (line 66)
  5. Handles errors with toast (line 67-69)
  6. Sets downloading state to null (line 70)
- **Connected to:** `api.downloadVideo()`

**`handleCopyUrl()`** (line 74-77)
- **Purpose:** Copies URL to clipboard
- **Process Flow:**
  1. Uses `navigator.clipboard.writeText(url)` (line 75)
  2. Shows success toast (line 76)

**`handleShare()`** (line 79-92)
- **Purpose:** Shares video using Web Share API or copies URL
- **Process Flow:**
  1. Checks if `navigator.share` is available (line 80)
  2. If available, calls share API with title and URL (line 82-85)
  3. If share fails or unavailable, calls `handleCopyUrl()` (line 87, 90)

**`handlePaste()`** (line 94-104)
- **Purpose:** Pastes URL from clipboard
- **Process Flow:**
  1. Uses `navigator.clipboard.readText()` (line 96)
  2. Sets url state (line 97)
  3. Validates and shows toast if valid (line 98-100)
  4. Handles errors with toast (line 101-103)

**Component Rendering:**
- Renders `Header` component (line 108)
- Renders URL input section (line 127-186)
- Renders `VideoInfo` component if videoInfo exists (line 189-191)
- Renders `DownloadOptions` component if videoInfo exists (line 194-201)
- Renders features section (line 204-228)
- Renders footer (line 232-235)

---

### 2. `frontend/src/services/api.js` - API Service Layer

**Configuration:**
- `API_BASE_URL` - From environment variable `VITE_API_URL`
- `api` - Axios instance with 30s timeout

**Functions:**

**`fetchVideoInfo(url)`** (line 10-13)
- **Purpose:** Fetches video information from backend
- **Parameters:** `url` (string)
- **Returns:** `Promise<object>` - Video metadata
- **API Call:** `GET /api/info?url=<url>`
- **Used by:** `App.handleFetchInfo()`

**`downloadAudio(url, format = 'mp3')`** (line 15-30)
- **Purpose:** Downloads audio from backend
- **Parameters:** `url` (string), `format` (string)
- **Returns:** `Promise<void>` - Triggers browser download
- **API Call:** `GET /api/download/audio?url=<url>&format=<format>`
- **Response Type:** `blob`
- **Process Flow:**
  1. Makes API request with blob response (line 16-19)
  2. Creates object URL from blob (line 22)
  3. Creates temporary anchor element (line 23)
  4. Sets download attribute (line 25)
  5. Appends to DOM and clicks (line 26-27)
  6. Removes element and revokes URL (line 28-29)
- **Used by:** `App.handleDownloadAudio()`

**`downloadVideo(url, quality = '720')`** (line 32-47)
- **Purpose:** Downloads video from backend
- **Parameters:** `url` (string), `quality` (string)
- **Returns:** `Promise<void>` - Triggers browser download
- **API Call:** `GET /api/download/video?url=<url>&quality=<quality>`
- **Response Type:** `blob`
- **Process Flow:**
  1. Makes API request with blob response (line 33-36)
  2. Creates object URL from blob (line 39)
  3. Creates temporary anchor element (line 40)
  4. Sets download attribute (line 42)
  5. Appends to DOM and clicks (line 43-44)
  6. Removes element and revokes URL (line 45-46)
- **Used by:** `App.handleDownloadVideo()`

---

### 3. `frontend/src/components/VideoInfo.jsx` - Video Info Display

**Props:**
- `videoInfo` (object) - Video metadata from backend

**Functions:**

**`formatDuration(seconds)`** (line 4-8)
- **Purpose:** Formats duration in seconds to MM:SS
- **Parameters:** `seconds` (number)
- **Returns:** `string` - Formatted duration
- **Logic:** Converts to minutes and seconds, pads seconds with zero

**`formatViews(views)`** (line 10-18)
- **Purpose:** Formats view count with K/M suffixes
- **Parameters:** `views` (number)
- **Returns:** `string` - Formatted view count
- **Logic:** 
  - ≥1,000,000 → X.XM
  - ≥1,000 → X.XK
  - Otherwise → raw number

**Component Rendering:**
- Displays video thumbnail with duration badge (line 24-34)
- Displays video title (line 38-40)
- Displays uploader and view count with icons (line 42-51)
- Displays format badges (line 53-64)

---

### 4. `frontend/src/components/DownloadOptions.jsx` - Download Buttons

**Props:**
- `videoInfo` (object) - Video metadata
- `onDownloadAudio` (function) - Audio download handler
- `onDownloadVideo` (function) - Video download handler
- `downloading` (string/null) - Current download state

**Constants:**
- `qualities` (array) - Available video qualities: ['1080', '720', '360', '144']
- `audioQualities` (array) - Audio quality options with labels and bitrates

**Functions:**

**`isDownloading(type)`** (line 11)
- **Purpose:** Checks if a specific download is in progress
- **Parameters:** `type` (string)
- **Returns:** `boolean`
- **Logic:** Compares `downloading` prop to type

**Component Rendering:**
- Audio download section (line 15-50):
  - Maps through `audioQualities` array
  - Each button calls `onDownloadAudio(quality.value)`
  - Shows loading spinner if `isDownloading('audio')`
- Video download section (line 52-95):
  - Maps through `qualities` array
  - Each button calls `onDownloadVideo(quality)`
  - Shows loading spinner if `isDownloading('video-{quality}')`
  - Checks availability based on videoInfo.formats
  - Displays available qualities at bottom

---

### 5. `frontend/src/components/Header.jsx` - Header Component

**Props:** None

**Component Rendering:**
- Displays YouTube icon with gradient background (line 8-10)
- Displays app title "YT Downloader" (line 12)
- Displays tagline "Fast • Free • Secure" (line 13)

---

## Complete User Flow - Step by Step

### Scenario 1: Fetching Video Information

1. **User Action:** User enters YouTube URL in input field
2. **Frontend:** `App.jsx` - `url` state updates via `onChange` handler
3. **User Action:** User clicks "Fetch" button
4. **Frontend:** `App.jsx` - `handleFetchInfo()` is called
5. **Frontend:** Validates URL is not empty
6. **Frontend:** Validates URL format using `isValidYouTubeUrl()`
7. **Frontend:** Sets `loading` state to true
8. **Frontend:** `App.jsx` - Calls `api.fetchVideoInfo(url)`
9. **Frontend:** `api.js` - Makes GET request to `/api/info?url=<url>`
10. **Backend:** `server.js` - Route matches `/api/info`
11. **Backend:** Calls `fetchVideoInfo(req, res)` from `downloadRoutes.js`
12. **Backend:** Validates URL parameter exists
13. **Backend:** Validates URL format using `isValidYouTubeUrl()`
14. **Backend:** Sanitizes URL using `sanitizeUrl()`
15. **Backend:** Constructs yt-dlp arguments with `--dump-json`
16. **Backend:** Calls `executeYtDlp(args)`
17. **Backend:** Spawns Python process with yt-dlp module
18. **Backend:** Captures stdout from yt-dlp
19. **Backend:** Parses JSON output
20. **Backend:** Extracts and formats video information
21. **Backend:** Returns JSON response with video metadata
22. **Frontend:** `api.js` - Receives response data
23. **Frontend:** `App.jsx` - Updates `videoInfo` state
24. **Frontend:** Shows success toast
25. **Frontend:** Sets `loading` state to false
26. **Frontend:** `App.jsx` - Renders `VideoInfo` component with data
27. **Frontend:** `App.jsx` - Renders `DownloadOptions` component with data

### Scenario 2: Downloading Audio

1. **User Action:** User clicks audio download button (e.g., "Best Quality")
2. **Frontend:** `DownloadOptions.jsx` - Button onClick calls `onDownloadAudio('mp3')`
3. **Frontend:** `App.jsx` - `handleDownloadAudio('mp3')` is called
4. **Frontend:** Sets `downloading` state to 'audio'
5. **Frontend:** Calls `api.downloadAudio(url, 'mp3')`
6. **Frontend:** `api.js` - Makes GET request to `/api/download/audio?url=<url>&format=mp3` with `responseType: 'blob'`
7. **Backend:** `server.js` - Route matches `/api/download/audio`
8. **Backend:** Calls `downloadAudio(req, res)` from `downloadRoutes.js`
9. **Backend:** Validates URL parameter exists
10. **Backend:** Validates URL format using `isValidYouTubeUrl()`
11. **Backend:** Sanitizes URL using `sanitizeUrl()`
12. **Backend:** Sets response headers (Content-Type, Content-Disposition)
13. **Backend:** Constructs yt-dlp arguments for audio extraction
14. **Backend:** Spawns Python process with yt-dlp module
15. **Backend:** Pipes yt-dlp stdout to response stream
16. **Backend:** Streams audio data to client
17. **Frontend:** `api.js` - Receives blob response
18. **Frontend:** Creates object URL from blob
19. **Frontend:** Creates temporary anchor element
20. **Frontend:** Triggers download via click
21. **Frontend:** Cleans up DOM and revokes URL
22. **Frontend:** `App.jsx` - Shows success toast
23. **Frontend:** Sets `downloading` state to null

### Scenario 3: Downloading Video

1. **User Action:** User clicks video quality button (e.g., "720p")
2. **Frontend:** `DownloadOptions.jsx` - Button onClick calls `onDownloadVideo('720')`
3. **Frontend:** `App.jsx` - `handleDownloadVideo('720')` is called
4. **Frontend:** Sets `downloading` state to 'video-720'
5. **Frontend:** Calls `api.downloadVideo(url, '720')`
6. **Frontend:** `api.js` - Makes GET request to `/api/download/video?url=<url>&quality=720` with `responseType: 'blob'`
7. **Backend:** `server.js` - Route matches `/api/download/video`
8. **Backend:** Calls `downloadVideo(req, res)` from `downloadRoutes.js`
9. **Backend:** Validates URL parameter exists
10. **Backend:** Validates URL format using `isValidYouTubeUrl()`
11. **Backend:** Sanitizes URL using `sanitizeUrl()`
12. **Backend:** Sets response headers (Content-Type, Content-Disposition)
13. **Backend:** Constructs format string based on quality
14. **Backend:** Constructs yt-dlp arguments for video download
15. **Backend:** Spawns Python process with yt-dlp module
16. **Backend:** Pipes yt-dlp stdout to response stream
17. **Backend:** Streams video data to client
18. **Frontend:** `api.js` - Receives blob response
19. **Frontend:** Creates object URL from blob
20. **Frontend:** Creates temporary anchor element
21. **Frontend:** Triggers download via click
22. **Frontend:** Cleans up DOM and revokes URL
23. **Frontend:** `App.jsx` - Shows success toast
24. **Frontend:** Sets `downloading` state to null

### Scenario 4: Copy/Paste URL

1. **User Action:** User clicks "Paste URL" button
2. **Frontend:** `App.jsx` - `handlePaste()` is called
3. **Frontend:** Uses `navigator.clipboard.readText()`
4. **Frontend:** Updates `url` state with clipboard content
5. **Frontend:** Validates URL using `isValidYouTubeUrl()`
6. **Frontend:** Shows success toast if valid

1. **User Action:** User clicks copy icon in input field
2. **Frontend:** `App.jsx` - `handleCopyUrl()` is called
3. **Frontend:** Uses `navigator.clipboard.writeText(url)`
4. **Frontend:** Shows success toast

### Scenario 5: Share Video

1. **User Action:** User clicks "Share" button (only visible after fetch)
2. **Frontend:** `App.jsx` - `handleShare()` is called
3. **Frontend:** Checks if `navigator.share` is available
4. **Frontend:** If available, calls native share API with title and URL
5. **Frontend:** If unavailable or fails, falls back to `handleCopyUrl()`

---

## Data Flow Diagram

```
User Input (URL)
    ↓
App.jsx (url state)
    ↓
handleFetchInfo()
    ↓
api.fetchVideoInfo()
    ↓
Axios GET /api/info
    ↓
server.js (Express)
    ↓
downloadRoutes.fetchVideoInfo()
    ↓
isValidYouTubeUrl() → sanitizeUrl()
    ↓
executeYtDlp() → Python yt-dlp
    ↓
YouTube API
    ↓
JSON Response
    ↓
format/filter video data
    ↓
Response to Frontend
    ↓
App.jsx (videoInfo state)
    ↓
VideoInfo Component (display)
    ↓
DownloadOptions Component (buttons)
    ↓
User clicks download
    ↓
handleDownloadAudio/Video()
    ↓
api.downloadAudio/Video()
    ↓
Axios GET /api/download/*
    ↓
server.js (Express)
    ↓
downloadRoutes.downloadAudio/Video()
    ↓
isValidYouTubeUrl() → sanitizeUrl()
    ↓
spawn yt-dlp process
    ↓
Stream to response
    ↓
Blob response to frontend
    ↓
Create download link
    ↓
Browser download
```

---

## Function Connection Matrix

| Function | Calls | Called By |
|----------|-------|-----------|
| **Backend - server.js** |
| app.listen | - | - |
| app.get('/health') | - | HTTP Client |
| app.get('/api/info') | fetchVideoInfo | HTTP Client |
| app.get('/api/download/audio') | downloadAudio | HTTP Client |
| app.get('/api/download/video') | downloadVideo | HTTP Client |
| **Backend - downloadRoutes.js** |
| isValidYouTubeUrl | - | fetchVideoInfo, downloadAudio, downloadVideo |
| sanitizeUrl | - | fetchVideoInfo, downloadAudio, downloadVideo |
| executeYtDlp | spawn | fetchVideoInfo |
| fetchVideoInfo | isValidYouTubeUrl, sanitizeUrl, executeYtDlp | server.js route |
| downloadAudio | isValidYouTubeUrl, sanitizeUrl | server.js route |
| downloadVideo | isValidYouTubeUrl, sanitizeUrl | server.js route |
| **Frontend - App.jsx** |
| isValidYouTubeUrl | - | handleFetchInfo, handlePaste |
| handleFetchInfo | isValidYouTubeUrl, api.fetchVideoInfo | Fetch button onClick |
| handleDownloadAudio | api.downloadAudio | DownloadOptions onDownloadAudio |
| handleDownloadVideo | api.downloadVideo | DownloadOptions onDownloadVideo |
| handleCopyUrl | - | Copy button onClick, handleShare |
| handleShare | handleCopyUrl | Share button onClick |
| handlePaste | isValidYouTubeUrl | Paste button onClick |
| **Frontend - api.js** |
| fetchVideoInfo | axios.get | App.handleFetchInfo |
| downloadAudio | axios.get | App.handleDownloadAudio |
| downloadVideo | axios.get | App.handleDownloadVideo |
| **Frontend - VideoInfo.jsx** |
| formatDuration | - | Component render |
| formatViews | - | Component render |
| **Frontend - DownloadOptions.jsx** |
| isDownloading | - | Component render |

---

## Security Flow

1. **Input Validation (Client-side):**
   - `App.isValidYouTubeUrl()` - Regex pattern matching
   - Prevents invalid requests before sending to server

2. **Input Validation (Server-side):**
   - `downloadRoutes.isValidYouTubeUrl()` - URL hostname validation
   - Checks against allowed YouTube domains

3. **Sanitization:**
   - `downloadRoutes.sanitizeUrl()` - Removes shell metacharacters
   - Prevents command injection attacks

4. **Safe Execution:**
   - `executeYtDlp()` - Uses `spawn` with `shell: false`
   - Prevents shell injection

5. **Rate Limiting:**
   - `express-rate-limit` middleware
   - Prevents abuse and DoS attacks

6. **Security Headers:**
   - `helmet` middleware
   - Sets secure HTTP headers

7. **CORS Protection:**
   - Configurable CORS origins
   - Prevents unauthorized cross-origin requests

---

## Error Handling Flow

### Frontend Error Handling
- `handleFetchInfo()`: Catches errors, shows toast, clears videoInfo
- `handleDownloadAudio()`: Catches errors, shows toast
- `handleDownloadVideo()`: Catches errors, shows toast
- `handlePaste()`: Catches clipboard errors, shows toast
- `handleShare()`: Catches share errors, falls back to copy

### Backend Error Handling
- `fetchVideoInfo()`: 
  - 400: Missing/invalid URL
  - 404: Private/unavailable video
  - 403: Age-restricted video
  - 500: Server error
- `downloadAudio()`: 400 (invalid URL), 500 (download failure)
- `downloadVideo()`: 400 (invalid URL), 500 (download failure)
- Global error middleware: Catches all errors, returns 500
- 404 handler: Returns 404 for unknown routes

---

## Dependencies and External Services

### Backend Dependencies:
- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **dotenv** - Environment variables
- **yt-dlp** (external) - YouTube downloader (Python module)
- **ffmpeg** (external) - Audio/video processing

### Frontend Dependencies:
- **react** - UI framework
- **vite** - Build tool
- **axios** - HTTP client
- **lucide-react** - Icons
- **react-hot-toast** - Notifications
- **tailwindcss** - Styling

### External Services:
- **YouTube** - Video source (accessed via yt-dlp)

---

## Environment Setup Flow

1. **Backend Setup:**
   - Install Node.js dependencies: `npm install`
   - Configure `.env` file with PORT, CORS_ORIGIN, RATE_LIMIT settings
   - Ensure Python and yt-dlp are installed
   - Ensure FFmpeg is installed
   - Start server: `npm run dev` or `npm start`

2. **Frontend Setup:**
   - Install Node.js dependencies: `npm install`
   - Configure `.env` file with VITE_API_URL
   - Start dev server: `npm run dev`
   - Build for production: `npm run build`

---

## Deployment Flow

### Backend Deployment:
1. Push code to repository
2. Deploy to platform (Render/Railway)
3. Set environment variables in platform
4. Ensure yt-dlp and FFmpeg are available
5. Configure CORS_ORIGIN to frontend URL
6. Backend becomes accessible at deployed URL

### Frontend Deployment:
1. Build frontend: `npm run build`
2. Push to repository
3. Deploy to platform (Vercel/Netlify)
4. Set VITE_API_URL to backend URL
5. Frontend becomes accessible at deployed URL

---

## Key Technical Decisions

1. **Streaming Downloads:** Files are streamed directly from yt-dlp to client without disk storage
2. **Child Process:** Uses `spawn` instead of `exec` for security and streaming capability
3. **Blob Handling:** Frontend creates object URLs for browser downloads
4. **State Management:** React useState for local component state
5. **API Layer:** Separate api.js for centralized API calls
6. **Component Separation:** UI split into reusable components
7. **Validation:** Both client-side and server-side validation
8. **Error Boundaries:** Try-catch blocks at async operation boundaries
9. **Toast Notifications:** User feedback for all operations
10. **Responsive Design:** Mobile-first approach with Tailwind CSS

---

## Summary

This workflow document covers:
- Complete project structure
- All backend functions and their connections
- All frontend functions and their connections
- Step-by-step user flows for all scenarios
- Data flow from user input to download
- Security measures and validation
- Error handling at each layer
- Dependencies and external services
- Deployment considerations

The application follows a clean separation of concerns with:
- Frontend: React components for UI, api.js for API communication
- Backend: Express server for routing, downloadRoutes.js for business logic
- External: yt-dlp for YouTube interaction, FFmpeg for media processing
