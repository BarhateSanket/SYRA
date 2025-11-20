import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Download, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Toast from './Toast';
import ProgressBar from './ProgressBar';

const YouTubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // Fetch video information
  const fetchVideoInfo = async () => {
    if (!url.trim()) {
      Toast.show('Please enter a YouTube URL', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/youtube/download/info?url=${encodeURIComponent(url)}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setVideoInfo(data.data);
        setSelectedFormat('');
        setSelectedQuality('');
        Toast.show('Video information loaded successfully', 'success');
      } else {
        Toast.show(data.message || 'Failed to load video information', 'error');
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
      Toast.show('Failed to load video information', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Start download
  const startDownload = async () => {
    if (!selectedFormat) {
      Toast.show('Please select a format', 'error');
      return;
    }

    if (selectedFormat !== 'mp3' && !selectedQuality) {
      Toast.show('Please select a quality', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/youtube/download/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          url,
          format: selectedFormat,
          quality: selectedQuality
        })
      });

      const data = await response.json();

      if (data.success) {
        setDownloadStatus({
          id: data.data.downloadId,
          status: 'downloading',
          filename: data.data.filename
        });
        setDownloadProgress(0);
        Toast.show('Download started successfully', 'success');

        // Start polling for progress
        pollDownloadStatus(data.data.downloadId);
      } else {
        Toast.show(data.message || 'Failed to start download', 'error');
      }
    } catch (error) {
      console.error('Error starting download:', error);
      Toast.show('Failed to start download', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Poll download status
  const pollDownloadStatus = async (downloadId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/youtube/download/status/${downloadId}`, {
          credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
          const status = data.data;

          if (status.status === 'completed') {
            setDownloadStatus(prev => ({ ...prev, status: 'completed' }));
            setDownloadProgress(100);
            clearInterval(pollInterval);
            Toast.show('Download completed successfully!', 'success');
            fetchDownloadHistory();
          } else if (status.status === 'failed') {
            setDownloadStatus(prev => ({ ...prev, status: 'failed', error: status.errorMessage }));
            clearInterval(pollInterval);
            Toast.show('Download failed: ' + status.errorMessage, 'error');
          }
        }
      } catch (error) {
        console.error('Error polling download status:', error);
      }
    }, 2000);

    // Clear polling after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 600000);
  };

  // Download completed file
  const downloadFile = async (downloadId) => {
    try {
      const response = await fetch(`/api/youtube/download/file/${downloadId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadStatus.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        Toast.show('File downloaded successfully', 'success');
      } else {
        Toast.show('Failed to download file', 'error');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Toast.show('Failed to download file', 'error');
    }
  };

  // Fetch download history
  const fetchDownloadHistory = async () => {
    try {
      const response = await fetch('/api/youtube/download/history', {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setDownloadHistory(data.data.downloads);
      }
    } catch (error) {
      console.error('Error fetching download history:', error);
    }
  };

  // Cancel download
  const cancelDownload = async (downloadId) => {
    try {
      const response = await fetch(`/api/youtube/download/cancel/${downloadId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setDownloadStatus(prev => ({ ...prev, status: 'cancelled' }));
        Toast.show('Download cancelled', 'info');
      } else {
        Toast.show('Failed to cancel download', 'error');
      }
    } catch (error) {
      console.error('Error cancelling download:', error);
      Toast.show('Failed to cancel download', 'error');
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchDownloadHistory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Copyright Disclaimer */}
      {showDisclaimer && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Copyright Notice:</strong> Only download videos you own or have permission to download.
            Respect copyright laws and content creators' rights. SYRA is not responsible for misuse.
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-auto p-0 text-orange-600 hover:text-orange-800"
              onClick={() => setShowDisclaimer(false)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            YouTube Downloader
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">YouTube URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={fetchVideoInfo}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Get Info'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Information */}
      {videoInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Video Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-32 h-24 object-cover rounded"
              />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">{videoInfo.title}</h3>
                <p className="text-sm text-gray-600">{videoInfo.channelTitle}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Duration: {formatDuration(videoInfo.duration)}</span>
                  <span>Views: {videoInfo.viewCount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4 Video</SelectItem>
                    <SelectItem value="mp3">MP3 Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedFormat === 'mp4' && (
                <div className="space-y-2">
                  <Label>Quality</Label>
                  <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {videoInfo.availableFormats.video.map((format) => (
                        <SelectItem key={format.quality} value={format.quality}>
                          {format.quality} ({formatFileSize(format.contentLength)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button
              onClick={startDownload}
              disabled={isLoading || !selectedFormat || (selectedFormat === 'mp4' && !selectedQuality)}
              className="w-full"
            >
              {isLoading ? 'Starting Download...' : 'Start Download'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Download Status */}
      {downloadStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {downloadStatus.status === 'downloading' && <Clock className="h-5 w-5 text-blue-600" />}
              {downloadStatus.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {downloadStatus.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
              {downloadStatus.status === 'cancelled' && <XCircle className="h-5 w-5 text-gray-600" />}
              Download Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{downloadStatus.filename}</span>
              <Badge
                variant={
                  downloadStatus.status === 'completed' ? 'default' :
                  downloadStatus.status === 'failed' ? 'destructive' :
                  downloadStatus.status === 'cancelled' ? 'secondary' : 'outline'
                }
              >
                {downloadStatus.status}
              </Badge>
            </div>

            {downloadStatus.status === 'downloading' && (
              <div className="space-y-2">
                <Progress value={downloadProgress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">
                  Downloading... {downloadProgress}%
                </p>
              </div>
            )}

            {downloadStatus.status === 'failed' && downloadStatus.error && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {downloadStatus.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {downloadStatus.status === 'completed' && (
                <Button
                  onClick={() => downloadFile(downloadStatus.id)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              )}

              {(downloadStatus.status === 'downloading' || downloadStatus.status === 'pending') && (
                <Button
                  variant="outline"
                  onClick={() => cancelDownload(downloadStatus.id)}
                  className="flex-1"
                >
                  Cancel Download
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download History */}
      {downloadHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Download History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {downloadHistory.map((download) => (
                <div key={download._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium truncate">{download.videoTitle}</p>
                    <div className="flex gap-2 text-sm text-gray-500">
                      <span>{download.format}</span>
                      <span>•</span>
                      <span>{formatFileSize(download.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(download.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      download.status === 'completed' ? 'default' :
                      download.status === 'failed' ? 'destructive' : 'secondary'
                    }
                  >
                    {download.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YouTubeDownloader;