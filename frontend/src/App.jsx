import { useState } from 'react';
import { Download, Youtube, Music, Video, Loader2, Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchVideoInfo, downloadAudio, downloadVideo } from './services/api';
import VideoInfo from './components/VideoInfo';
import DownloadOptions from './components/DownloadOptions';
import Header from './components/Header';

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const isValidYouTubeUrl = (url) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return pattern.test(url);
  };

  const handleFetchInfo = async () => {
    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    setVideoInfo(null);

    try {
      const data = await fetchVideoInfo(url);
      setVideoInfo(data);
      toast.success('Video information fetched successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch video information');
      setVideoInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAudio = async (format = 'mp3') => {
    if (!videoInfo) return;
    
    setDownloading('audio');
    try {
      await downloadAudio(url, format);
      toast.success('Audio download started!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to download audio');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadVideo = async (quality) => {
    if (!videoInfo) return;
    
    setDownloading(`video-${quality}`);
    try {
      await downloadVideo(url, quality);
      toast.success('Video download started!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to download video');
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoInfo?.title || 'YouTube Video',
          url: url
        });
      } catch (error) {
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      if (isValidYouTubeUrl(text)) {
        toast.success('URL pasted successfully!');
      }
    } catch (error) {
      toast.error('Failed to paste from clipboard');
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-float">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-3xl shadow-2xl">
              <Youtube className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">YouTube Downloader</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            Download videos and audio in high quality for free
          </p>
        </div>

        {/* URL Input Section */}
        <div className="glass-card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPaste={handlePaste}
                placeholder="Paste YouTube URL here..."
                className="input-field pr-12"
              />
              <button
                onClick={handleCopyUrl}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                title="Copy URL"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleFetchInfo}
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Fetch</span>
                </>
              )}
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handlePaste}
              className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Paste URL</span>
              <span className="sm:hidden">Paste</span>
            </button>
            {videoInfo && (
              <button
                onClick={handleShare}
                className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
                <span className="sm:hidden">Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Info Section */}
        {videoInfo && (
          <VideoInfo videoInfo={videoInfo} />
        )}

        {/* Download Options Section */}
        {videoInfo && (
          <DownloadOptions
            videoInfo={videoInfo}
            onDownloadAudio={handleDownloadAudio}
            onDownloadVideo={handleDownloadVideo}
            downloading={downloading}
          />
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">HD Video Downloads</h3>
            <p className="text-gray-400 text-sm">Download videos in 1080p, 720p, 360p, and more</p>
          </div>
          
          <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Audio Extraction</h3>
            <p className="text-gray-400 text-sm">Extract high-quality MP3 audio from videos</p>
          </div>
          
          <div className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Fast & Free</h3>
            <p className="text-gray-400 text-sm">No registration required, completely free</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>Built with ❤️ using React, Tailwind CSS, and yt-dlp</p>
        <p className="mt-2">Please respect copyright laws and YouTube's terms of service</p>
      </footer>
    </div>
  );
}

export default App;
