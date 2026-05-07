import { Clock, Eye, User, Play } from 'lucide-react';

const VideoInfo = ({ videoInfo }) => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="glass-card p-6 md:p-8 mb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnail */}
        <div className="relative w-full md:w-80 flex-shrink-0">
          <img
            src={videoInfo.thumbnail}
            alt={videoInfo.title}
            className="w-full aspect-video object-cover rounded-xl shadow-lg"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {videoInfo.duration_string || formatDuration(videoInfo.duration)}
          </div>
        </div>

        {/* Video Details */}
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold mb-3 line-clamp-2">
            {videoInfo.title}
          </h2>
          
          <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="truncate max-w-[150px] md:max-w-[200px]">{videoInfo.uploader}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{formatViews(videoInfo.view_count)} views</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {videoInfo.formats && videoInfo.formats.length > 0 && (
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                {videoInfo.formats.length} video formats
              </div>
            )}
            {videoInfo.audio_formats && videoInfo.audio_formats.length > 0 && (
              <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                {videoInfo.audio_formats.length} audio formats
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;
