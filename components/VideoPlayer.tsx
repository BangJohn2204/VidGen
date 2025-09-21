
import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  prompt: string;
}

const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, prompt }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-lg overflow-hidden shadow-2xl">
      <div className="p-4">
        <p className="text-sm text-slate-400">Generated Video for:</p>
        <p className="text-white font-medium truncate">"{prompt}"</p>
      </div>
      <video
        key={videoUrl}
        className="w-full aspect-video"
        controls
        autoPlay
        loop
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="p-4 bg-slate-800/50 flex justify-center">
        <a
          href={videoUrl}
          download={`veo3-generated-video.mp4`}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-transform transform hover:scale-105"
        >
          <DownloadIcon />
          Download Video
        </a>
      </div>
    </div>
  );
};

export default VideoPlayer;
