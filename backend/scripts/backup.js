import mongoose from 'mongoose';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import logger from '../middlewares/apiLogger.js';

const execAsync = promisify(exec);

// Backup configuration
const BACKUP_CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/syra',
  BACKUP_DIR: process.env.BACKUP_DIR || './backups',
  RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
  SCHEDULE: process.env.BACKUP_SCHEDULE || '0 2 * * *' // Daily at 2 AM
};

// Ensure backup directory exists
const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_CONFIG.BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_CONFIG.BACKUP_DIR, { recursive: true });
    logger.info('Backup directory created', { path: BACKUP_CONFIG.BACKUP_DIR });
  }
};

// Generate backup filename with timestamp
const generateBackupFilename = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `syra-backup-${timestamp}.gz`;
};

// Create MongoDB database backup
export const createDatabaseBackup = async () => {
  try {
    ensureBackupDir();

    const backupFilename = generateBackupFilename();
    const backupPath = path.join(BACKUP_CONFIG.BACKUP_DIR, backupFilename);

    // Extract database name from URI
    const dbName = BACKUP_CONFIG.MONGODB_URI.split('/').pop().split('?')[0];

    // Create mongodump command
    const dumpCommand = `mongodump --uri="${BACKUP_CONFIG.MONGODB_URI}" --db=${dbName} --archive="${backupPath}" --gzip`;

    logger.info('Starting database backup', { filename: backupFilename });

    const { stdout, stderr } = await execAsync(dumpCommand);

    if (stderr) {
      logger.warn('Backup stderr output', { stderr });
    }

    // Verify backup file was created and get size
    const stats = fs.statSync(backupPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    logger.info('Database backup completed successfully', {
      filename: backupFilename,
      size: `${fileSizeMB}MB`,
      path: backupPath
    });

    return {
      success: true,
      filename: backupFilename,
      path: backupPath,
      size: `${fileSizeMB}MB`
    };

  } catch (error) {
    logger.error('Database backup failed', {
      error: error.message,
      stack: error.stack
    });

    throw new Error(`Backup failed: ${error.message}`);
  }
};

// List all backup files
export const listBackups = () => {
  try {
    ensureBackupDir();

    const files = fs.readdirSync(BACKUP_CONFIG.BACKUP_DIR)
      .filter(file => file.endsWith('.gz'))
      .map(file => {
        const filePath = path.join(BACKUP_CONFIG.BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          path: filePath,
          size: stats.size,
          sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Most recent first

    return files;
  } catch (error) {
    logger.error('Failed to list backups', { error: error.message });
    throw error;
  }
};

// Restore database from backup
export const restoreDatabase = async (backupFilename) => {
  try {
    const backupPath = path.join(BACKUP_CONFIG.BACKUP_DIR, backupFilename);

    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupFilename}`);
    }

    // Extract database name from URI
    const dbName = BACKUP_CONFIG.MONGODB_URI.split('/').pop().split('?')[0];

    logger.info('Starting database restore', { filename: backupFilename, database: dbName });

    // Create mongorestore command
    const restoreCommand = `mongorestore --uri="${BACKUP_CONFIG.MONGODB_URI}" --db=${dbName} --archive="${backupPath}" --gzip --drop`;

    const { stdout, stderr } = await execAsync(restoreCommand);

    if (stderr) {
      logger.warn('Restore stderr output', { stderr });
    }

    logger.info('Database restore completed successfully', {
      filename: backupFilename,
      database: dbName
    });

    return {
      success: true,
      filename: backupFilename,
      database: dbName,
      restoredAt: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Database restore failed', {
      error: error.message,
      filename: backupFilename
    });

    throw new Error(`Restore failed: ${error.message}`);
  }
};

// Clean up old backups based on retention policy
export const cleanupOldBackups = () => {
  try {
    const backups = listBackups();
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - BACKUP_CONFIG.RETENTION_DAYS);

    let deletedCount = 0;
    let freedSpace = 0;

    for (const backup of backups) {
      if (backup.createdAt < retentionDate) {
        fs.unlinkSync(backup.path);
        deletedCount++;
        freedSpace += backup.size;
        logger.info('Old backup deleted', {
          filename: backup.filename,
          age: Math.floor((Date.now() - backup.createdAt) / (1000 * 60 * 60 * 24))
        });
      }
    }

    if (deletedCount > 0) {
      logger.info('Backup cleanup completed', {
        deletedCount,
        freedSpaceMB: (freedSpace / (1024 * 1024)).toFixed(2)
      });
    }

    return { deletedCount, freedSpace };

  } catch (error) {
    logger.error('Backup cleanup failed', { error: error.message });
    throw error;
  }
};

// Get backup statistics
export const getBackupStats = () => {
  try {
    const backups = listBackups();
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const oldestBackup = backups.length > 0 ? backups[backups.length - 1] : null;
    const newestBackup = backups.length > 0 ? backups[0] : null;

    return {
      totalBackups: backups.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      oldestBackup: oldestBackup ? {
        filename: oldestBackup.filename,
        createdAt: oldestBackup.createdAt
      } : null,
      newestBackup: newestBackup ? {
        filename: newestBackup.filename,
        createdAt: newestBackup.createdAt
      } : null,
      retentionDays: BACKUP_CONFIG.RETENTION_DAYS
    };
  } catch (error) {
    logger.error('Failed to get backup stats', { error: error.message });
    throw error;
  }
};

// Manual backup execution (for CLI or API calls)
export const runManualBackup = async () => {
  try {
    logger.info('Manual backup initiated');

    const result = await createDatabaseBackup();
    await cleanupOldBackups();

    logger.info('Manual backup completed', result);
    return result;

  } catch (error) {
    logger.error('Manual backup failed', { error: error.message });
    throw error;
  }
};

// Export backup configuration for external use
export { BACKUP_CONFIG };
