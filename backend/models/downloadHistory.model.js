import mongoose from "mongoose";

const downloadHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  videoTitle: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  format: {
    type: String,
    enum: ['mp4-360p', 'mp4-720p', 'mp4-1080p', 'mp3'],
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  downloadPath: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  downloadDuration: {
    type: Number, // in seconds
    required: true
  },
  errorMessage: {
    type: String
  }
}, { timestamps: true });

// Index for efficient queries
downloadHistorySchema.index({ userId: 1, createdAt: -1 });
downloadHistorySchema.index({ videoId: 1 });

const DownloadHistory = mongoose.model("DownloadHistory", downloadHistorySchema);
export default DownloadHistory;