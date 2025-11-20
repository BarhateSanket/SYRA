import React from 'react';
import YouTubeDownloader from '../components/YouTubeDownloader';

const YouTubeDownloaderPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            YouTube Downloader
          </h1>
          <p className="text-gray-600">
            Download YouTube videos in multiple formats with premium quality
          </p>
        </div>

        <YouTubeDownloader />
      </div>
    </div>
  );
};

export default YouTubeDownloaderPage;