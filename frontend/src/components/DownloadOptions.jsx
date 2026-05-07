import { Music, Video, Loader2, Download } from 'lucide-react';

const DownloadOptions = ({ videoInfo, onDownloadAudio, onDownloadVideo, downloading }) => {
  const qualities = ['1080', '720', '360', '144'];
  
  const audioQualities = [
    { label: 'Best Quality', value: 'mp3', bitrate: '320kbps' },
    { label: 'Standard', value: 'mp3', bitrate: '192kbps' },
  ];

  const isDownloading = (type) => downloading === type;

  return (
    <div className="space-y-6">
      {/* Audio Downloads */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Audio Downloads</h3>
            <p className="text-gray-400 text-sm">Extract audio in MP3 format</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {audioQualities.map((quality, index) => (
            <button
              key={index}
              onClick={() => onDownloadAudio(quality.value)}
              disabled={isDownloading('audio')}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative flex items-center justify-between">
                <div className="text-left">
                  <div className="font-semibold text-white">{quality.label}</div>
                  <div className="text-sm text-white/80">{quality.bitrate}</div>
                </div>
                {isDownloading('audio') ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Download className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Video Downloads */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-xl">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Video Downloads</h3>
            <p className="text-gray-400 text-sm">Download video in MP4 format</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {qualities.map((quality) => {
            const isAvailable = videoInfo.formats?.some(f => f.height && f.height >= parseInt(quality));
            const isQualityDownloading = isDownloading(`video-${quality}`);
            
            return (
              <button
                key={quality}
                onClick={() => onDownloadVideo(quality)}
                disabled={isQualityDownloading}
                className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="relative flex flex-col items-center gap-2">
                  <div className="text-2xl font-bold text-white">{quality}p</div>
                  {isQualityDownloading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {videoInfo.formats && videoInfo.formats.length > 0 && (
          <div className="mt-4 text-center text-gray-400 text-sm">
            Available qualities: {videoInfo.formats.map(f => f.height).filter(Boolean).join('p, ')}p
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadOptions;
