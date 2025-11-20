import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DownloadHistory from '../models/downloadHistory.model.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, '../downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

class YouTubeDownloaderController {
  // Get video info and available formats
  async getVideoInfo(req, res) {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'Video URL is required'
        });
      }

      if (!ytdl.validateURL(url)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL'
        });
      }

      const info = await ytdl.getInfo(url);
      const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

      // Filter and organize formats
      const availableFormats = {
        video: [],
        audio: []
      };

      // Video formats
      const videoFormats = formats.filter(f => f.hasVideo && f.hasAudio);
      const qualityMap = {
        '360p': videoFormats.find(f => f.qualityLabel === '360p'),
        '720p': videoFormats.find(f => f.qualityLabel === '720p'),
        '1080p': videoFormats.find(f => f.qualityLabel === '1080p')
      };

      Object.entries(qualityMap).forEach(([quality, format]) => {
        if (format) {
          availableFormats.video.push({
            quality,
            itag: format.itag,
            container: format.container,
            contentLength: format.contentLength,
            approxDurationMs: format.approxDurationMs
          });
        }
      });

      // Audio formats (MP3)
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      const bestAudio = audioFormats.find(f => f.audioBitrate === 128) || audioFormats[0];
      if (bestAudio) {
        availableFormats.audio.push({
          quality: '128kbps',
          itag: bestAudio.itag,
          container: 'mp3',
          contentLength: bestAudio.contentLength,
          approxDurationMs: bestAudio.approxDurationMs
        });
      }

      const videoDetails = {
        id: info.videoDetails.videoId,
        title: info.videoDetails.title,
        description: info.videoDetails.description,
        thumbnail: info.videoDetails.thumbnails[0]?.url,
        channelTitle: info.videoDetails.author.name,
        duration: info.videoDetails.lengthSeconds,
        viewCount: info.videoDetails.viewCount,
        uploadDate: info.videoDetails.uploadDate,
        availableFormats
      };

      logger.info(`Video info retrieved for: ${videoDetails.title}`);

      res.json({
        success: true,
        data: videoDetails
      });

    } catch (error) {
      logger.error('YouTube video info error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get video information',
        error: error.message
      });
    }
  }

  // Start download
  async startDownload(req, res) {
    try {
      const { url, format, quality } = req.body;
      const userId = req.userId;

      if (!url || !format) {
        return res.status(400).json({
          success: false,
          message: 'URL and format are required'
        });
      }

      if (!ytdl.validateURL(url)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL'
        });
      }

      // Generate unique filename
      const videoId = ytdl.getVideoID(url);
      const timestamp = Date.now();
      const extension = format === 'mp3' ? 'mp3' : 'mp4';
      const filename = `${videoId}_${timestamp}.${extension}`;
      const filepath = path.join(downloadsDir, filename);

      // Get video info
      const info = await ytdl.getInfo(url);

      // Determine format options
      let ytdlOptions = {};
      if (format === 'mp3') {
        ytdlOptions = {
          filter: 'audioonly',
          quality: 'highestaudio'
        };
      } else {
        // Video format
        const qualityMap = {
          '360p': '18',
          '720p': '22',
          '1080p': '37'
        };
        ytdlOptions = {
          quality: qualityMap[quality] || '18'
        };
      }

      // Start download
      const startTime = Date.now();
      const stream = ytdl(url, ytdlOptions);
      const writeStream = fs.createWriteStream(filepath);

      let downloadedBytes = 0;
      let totalBytes = 0;

      stream.on('progress', (chunkLength, downloaded, total) => {
        downloadedBytes = downloaded;
        totalBytes = total;
      });

      stream.pipe(writeStream);

      // Handle completion
      writeStream.on('finish', async () => {
        const downloadDuration = (Date.now() - startTime) / 1000;

        try {
          // Save to download history
          const downloadRecord = new DownloadHistory({
            userId,
            videoId: info.videoDetails.videoId,
            videoTitle: info.videoDetails.title,
            videoUrl: url,
            format: format === 'mp3' ? 'mp3' : `mp4-${quality}`,
            fileSize: fs.statSync(filepath).size,
            downloadPath: filepath,
            status: 'completed',
            downloadDuration
          });

          await downloadRecord.save();

          logger.info(`Download completed: ${info.videoDetails.title} (${format})`);

        } catch (dbError) {
          logger.error('Database save error:', dbError);
        }
      });

      // Handle errors
      stream.on('error', async (error) => {
        logger.error('Download stream error:', error);

        // Clean up file
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }

        try {
          // Save failed download record
          const downloadRecord = new DownloadHistory({
            userId,
            videoId: info.videoDetails.videoId,
            videoTitle: info.videoDetails.title,
            videoUrl: url,
            format: format === 'mp3' ? 'mp3' : `mp4-${quality}`,
            fileSize: 0,
            downloadPath: filepath,
            status: 'failed',
            downloadDuration: (Date.now() - startTime) / 1000,
            errorMessage: error.message
          });

          await downloadRecord.save();
        } catch (dbError) {
          logger.error('Database save error for failed download:', dbError);
        }
      });

      writeStream.on('error', (error) => {
        logger.error('Write stream error:', error);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      });

      // Return download ID for tracking
      const downloadId = `${videoId}_${timestamp}`;

      res.json({
        success: true,
        message: 'Download started',
        data: {
          downloadId,
          filename,
          estimatedSize: totalBytes || 'Unknown'
        }
      });

    } catch (error) {
      logger.error('Start download error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to start download',
        error: error.message
      });
    }
  }

  // Get download status
  async getDownloadStatus(req, res) {
    try {
      const { downloadId } = req.params;
      const userId = req.userId;

      // Find download record
      const downloadRecord = await DownloadHistory.findOne({
        userId,
        downloadPath: { $regex: downloadId }
      }).sort({ createdAt: -1 });

      if (!downloadRecord) {
        return res.status(404).json({
          success: false,
          message: 'Download not found'
        });
      }

      const fileExists = fs.existsSync(downloadRecord.downloadPath);

      res.json({
        success: true,
        data: {
          downloadId,
          status: downloadRecord.status,
          fileExists,
          fileSize: downloadRecord.fileSize,
          downloadDuration: downloadRecord.downloadDuration,
          createdAt: downloadRecord.createdAt,
          videoTitle: downloadRecord.videoTitle,
          format: downloadRecord.format
        }
      });

    } catch (error) {
      logger.error('Get download status error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get download status',
        error: error.message
      });
    }
  }

  // Download file
  async downloadFile(req, res) {
    try {
      const { downloadId } = req.params;
      const userId = req.userId;

      // Find download record
      const downloadRecord = await DownloadHistory.findOne({
        userId,
        downloadPath: { $regex: downloadId },
        status: 'completed'
      });

      if (!downloadRecord || !fs.existsSync(downloadRecord.downloadPath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found or download not completed'
        });
      }

      const filename = path.basename(downloadRecord.downloadPath);
      const sanitizedTitle = downloadRecord.videoTitle.replace(/[^a-zA-Z0-9]/g, '_');

      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.${downloadRecord.format.split('-')[0]}"`);
      res.setHeader('Content-Type', downloadRecord.format.includes('mp3') ? 'audio/mpeg' : 'video/mp4');
      res.setHeader('Content-Length', downloadRecord.fileSize);

      const fileStream = fs.createReadStream(downloadRecord.downloadPath);
      fileStream.pipe(res);

      // Clean up file after download (schedule for deletion after 1 hour)
      setTimeout(() => {
        if (fs.existsSync(downloadRecord.downloadPath)) {
          fs.unlinkSync(downloadRecord.downloadPath);
          logger.info(`Cleaned up download file: ${filename}`);
        }
      }, 60 * 60 * 1000); // 1 hour

    } catch (error) {
      logger.error('Download file error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }

  // Get download history
  async getDownloadHistory(req, res) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 10 } = req.query;

      const downloads = await DownloadHistory.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('videoTitle videoUrl format fileSize status downloadDuration createdAt errorMessage');

      const total = await DownloadHistory.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          downloads,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get download history error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get download history',
        error: error.message
      });
    }
  }

  // Cancel download (if still in progress)
  async cancelDownload(req, res) {
    try {
      const { downloadId } = req.params;
      const userId = req.userId;

      // Find and update download record
      const downloadRecord = await DownloadHistory.findOneAndUpdate(
        {
          userId,
          downloadPath: { $regex: downloadId },
          status: { $ne: 'completed' }
        },
        {
          status: 'cancelled',
          errorMessage: 'Download cancelled by user'
        },
        { new: true }
      );

      if (!downloadRecord) {
        return res.status(404).json({
          success: false,
          message: 'Download not found or already completed'
        });
      }

      // Clean up file if it exists
      if (fs.existsSync(downloadRecord.downloadPath)) {
        fs.unlinkSync(downloadRecord.downloadPath);
      }

      res.json({
        success: true,
        message: 'Download cancelled successfully'
      });

    } catch (error) {
      logger.error('Cancel download error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel download',
        error: error.message
      });
    }
  }
}

export default new YouTubeDownloaderController();