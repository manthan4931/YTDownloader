import { spawn } from 'child_process';
import { promisify } from 'util';
import { URL } from 'url';

// Validate YouTube URL
function isValidYouTubeUrl(url) {
  try {
    const parsed = new URL(url);
    const validHosts = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'];
    return validHosts.includes(parsed.hostname) || parsed.hostname === 'youtu.be';
  } catch {
    return false;
  }
}

// Sanitize URL to prevent command injection
function sanitizeUrl(url) {
  // Remove any shell metacharacters
  return url.replace(/[;&|`$()<>]/g, '');
}

// Execute yt-dlp command safely
function executeYtDlp(args) {
  return new Promise((resolve, reject) => {
    const ytDlp = spawn('yt-dlp', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    });

    let stdout = '';
    let stderr = '';

    ytDlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytDlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytDlp.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || 'yt-dlp process failed'));
      }
    });

    ytDlp.on('error', (err) => {
      reject(new Error(`Failed to execute yt-dlp: ${err.message}`));
    });
  });
}

// Fetch video information
export async function fetchVideoInfo(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const sanitizedUrl = sanitizeUrl(url);

    const args = [
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      sanitizedUrl
    ];

    const output = await executeYtDlp(args);
    const videoInfo = JSON.parse(output);

    // Extract relevant information
    const info = {
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      duration: videoInfo.duration,
      duration_string: videoInfo.duration_string,
      uploader: videoInfo.uploader,
      view_count: videoInfo.view_count,
      formats: videoInfo.formats
        .filter(f => f.ext === 'mp4' && f.vcodec !== 'none')
        .map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          quality: f.format_note || f.resolution || 'unknown',
          height: f.height,
          width: f.width,
          filesize: f.filesize,
          fps: f.fps
        }))
        .filter((f, i, arr) => arr.findIndex(x => x.height === f.height) === i) // Remove duplicates
        .sort((a, b) => (b.height || 0) - (a.height || 0)),
      audio_formats: videoInfo.formats
        .filter(f => f.ext === 'm4a' || f.ext === 'webm')
        .map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          abr: f.abr,
          filesize: f.filesize
        }))
        .filter((f, i, arr) => arr.findIndex(x => x.abr === f.abr) === i)
        .sort((a, b) => (b.abr || 0) - (a.abr || 0))
    };

    res.json(info);
  } catch (error) {
    console.error('Error fetching video info:', error);
    
    if (error.message.includes('Video unavailable') || error.message.includes('Private video')) {
      return res.status(404).json({ error: 'Video is private or unavailable' });
    }
    
    if (error.message.includes('Sign in to confirm you')) {
      return res.status(403).json({ error: 'Age-restricted video. Cannot download without authentication.' });
    }

    res.status(500).json({ error: 'Failed to fetch video information', message: error.message });
  }
}

// Download audio as MP3
export async function downloadAudio(req, res) {
  try {
    const { url, format = 'mp3' } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const sanitizedUrl = sanitizeUrl(url);

    // Set headers for streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="audio.${format}"`);

    const args = [
      '-f', 'bestaudio/best',
      '--extract-audio',
      '--audio-format', format,
      '--audio-quality', '0',
      '-o', '-',
      '--no-playlist',
      '--no-warnings',
      sanitizedUrl
    ];

    const ytDlp = spawn('yt-dlp', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    });

    ytDlp.stdout.pipe(res);

    ytDlp.stderr.on('data', (data) => {
      console.error('yt-dlp stderr:', data.toString());
    });

    ytDlp.on('close', (code) => {
      if (code !== 0) {
        console.error(`yt-dlp process exited with code ${code}`);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download audio' });
        }
      }
    });

    ytDlp.on('error', (err) => {
      console.error('yt-dlp error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to execute yt-dlp' });
      }
    });

    req.on('close', () => {
      ytDlp.kill();
    });

  } catch (error) {
    console.error('Error downloading audio:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download audio', message: error.message });
    }
  }
}

// Download video with specified quality
export async function downloadVideo(req, res) {
  try {
    const { url, quality = '720' } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const sanitizedUrl = sanitizeUrl(url);

    // Set headers for streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');

    // Format selection based on quality
    const formatString = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`;

    const args = [
      '-f', formatString,
      '--merge-output-format', 'mp4',
      '-o', '-',
      '--no-playlist',
      '--no-warnings',
      sanitizedUrl
    ];

    const ytDlp = spawn('yt-dlp', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    });

    ytDlp.stdout.pipe(res);

    ytDlp.stderr.on('data', (data) => {
      console.error('yt-dlp stderr:', data.toString());
    });

    ytDlp.on('close', (code) => {
      if (code !== 0) {
        console.error(`yt-dlp process exited with code ${code}`);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download video' });
        }
      }
    });

    ytDlp.on('error', (err) => {
      console.error('yt-dlp error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to execute yt-dlp' });
      }
    });

    req.on('close', () => {
      ytDlp.kill();
    });

  } catch (error) {
    console.error('Error downloading video:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download video', message: error.message });
    }
  }
}
