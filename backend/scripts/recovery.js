import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { restoreDatabase, listBackups } from './backup.js';
import logger from '../middlewares/apiLogger.js';

// Recovery configuration
const RECOVERY_CONFIG = {
  MAX_RECOVERY_ATTEMPTS: 3,
  RECOVERY_TIMEOUT: 300000, // 5 minutes
  VERIFICATION_QUERIES: [
    { collection: 'users', field: 'email' },
    { collection: 'subscriptions', field: 'status' },
    { collection: 'payments', field: 'amount' }
  ]
};

// Validate backup file before recovery
export const validateBackupFile = (backupFilename) => {
  try {
    const backupPath = path.join(process.env.BACKUP_DIR || './backups', backupFilename);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupFilename}`);
    }

    const stats = fs.statSync(backupPath);

    // Check file size (should be reasonable)
    if (stats.size < 1024) { // Less than 1KB
      throw new Error('Backup file appears to be corrupted (too small)');
    }

    // Check if file is a valid gzip archive (basic check)
    const buffer = Buffer.alloc(2);
    const fd = fs.openSync(backupPath, 'r');
    fs.readSync(fd, buffer, 0, 2, 0);
    fs.closeSync(fd);

    // Gzip magic number: 0x1f 0x8b
    if (buffer[0] !== 0x1f || buffer[1] !== 0x8b) {
      throw new Error('Backup file is not a valid gzip archive');
    }

    logger.info('Backup file validation passed', {
      filename: backupFilename,
      size: `${(stats.size / (1024 * 1024)).toFixed(2)}MB`
    });

    return true;
  } catch (error) {
    logger.error('Backup file validation failed', {
      filename: backupFilename,
      error: error.message
    });
    throw error;
  }
};

// Create recovery point (backup current state before recovery)
export const createRecoveryPoint = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const recoveryFilename = `recovery-point-${timestamp}.gz`;

    logger.info('Creating recovery point before restoration', { filename: recoveryFilename });

    // Import backup function dynamically to avoid circular dependency
    const { createDatabaseBackup } = await import('./backup.js');
    const result = await createDatabaseBackup();

    // Rename the backup to recovery point
    const fs = await import('fs');
    const path = await import('path');

    const originalPath = result.path;
    const recoveryPath = path.join(path.dirname(originalPath), recoveryFilename);

    fs.renameSync(originalPath, recoveryPath);

    logger.info('Recovery point created', {
      originalFilename: result.filename,
      recoveryFilename,
      path: recoveryPath
    });

    return {
      filename: recoveryFilename,
      path: recoveryPath,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Failed to create recovery point', { error: error.message });
    throw error;
  }
};

// Verify database integrity after recovery
export const verifyDatabaseIntegrity = async () => {
  try {
    logger.info('Starting database integrity verification');

    const results = {
      collections: {},
      totalDocuments: 0,
      issues: []
    };

    // Check each configured collection
    for (const query of RECOVERY_CONFIG.VERIFICATION_QUERIES) {
      try {
        const Model = mongoose.model(query.collection);
        const count = await Model.countDocuments();

        results.collections[query.collection] = {
          documentCount: count,
          status: 'verified'
        };

        results.totalDocuments += count;

      } catch (error) {
        results.collections[query.collection] = {
          status: 'error',
          error: error.message
        };
        results.issues.push(`${query.collection}: ${error.message}`);
      }
    }

    // Additional integrity checks
    try {
      // Check for orphaned documents or invalid references
      const User = mongoose.model('User');
      const Subscription = mongoose.model('Subscription');

      const usersWithInvalidSubscriptions = await User.countDocuments({
        currentSubscription: { $exists: true, $ne: null },
        $expr: {
          $not: {
            $in: ['$currentSubscription', await Subscription.distinct('_id')]
          }
        }
      });

      if (usersWithInvalidSubscriptions > 0) {
        results.issues.push(`${usersWithInvalidSubscriptions} users have invalid subscription references`);
      }

    } catch (error) {
      results.issues.push(`Reference integrity check failed: ${error.message}`);
    }

    results.status = results.issues.length === 0 ? 'healthy' : 'issues_found';

    logger.info('Database integrity verification completed', {
      status: results.status,
      totalDocuments: results.totalDocuments,
      issuesCount: results.issues.length
    });

    return results;

  } catch (error) {
    logger.error('Database integrity verification failed', { error: error.message });
    throw error;
  }
};

// Perform complete recovery operation
export const performRecovery = async (backupFilename, options = {}) => {
  const recoverySession = {
    id: `recovery-${Date.now()}`,
    backupFilename,
    startTime: new Date().toISOString(),
    steps: [],
    status: 'in_progress'
  };

  try {
    logger.info('Starting recovery operation', {
      sessionId: recoverySession.id,
      backupFilename
    });

    // Step 1: Validate backup file
    recoverySession.steps.push({ step: 'validation', status: 'in_progress' });
    validateBackupFile(backupFilename);
    recoverySession.steps[recoverySession.steps.length - 1].status = 'completed';

    // Step 2: Create recovery point (if not skipped)
    if (!options.skipRecoveryPoint) {
      recoverySession.steps.push({ step: 'recovery_point', status: 'in_progress' });
      const recoveryPoint = await createRecoveryPoint();
      recoverySession.recoveryPoint = recoveryPoint;
      recoverySession.steps[recoverySession.steps.length - 1].status = 'completed';
    }

    // Step 3: Restore database
    recoverySession.steps.push({ step: 'restore', status: 'in_progress' });
    const restoreResult = await restoreDatabase(backupFilename);
    recoverySession.steps[recoverySession.steps.length - 1].status = 'completed';

    // Step 4: Verify integrity
    recoverySession.steps.push({ step: 'verification', status: 'in_progress' });
    const integrityResult = await verifyDatabaseIntegrity();
    recoverySession.integrityCheck = integrityResult;
    recoverySession.steps[recoverySession.steps.length - 1].status = 'completed';

    // Step 5: Final checks
    if (integrityResult.status !== 'healthy' && !options.ignoreIntegrityIssues) {
      throw new Error(`Integrity check failed: ${integrityResult.issues.join(', ')}`);
    }

    recoverySession.status = 'completed';
    recoverySession.endTime = new Date().toISOString();

    logger.info('Recovery operation completed successfully', {
      sessionId: recoverySession.id,
      backupFilename,
      duration: new Date(recoverySession.endTime) - new Date(recoverySession.startTime)
    });

    return recoverySession;

  } catch (error) {
    recoverySession.status = 'failed';
    recoverySession.error = error.message;
    recoverySession.endTime = new Date().toISOString();

    logger.error('Recovery operation failed', {
      sessionId: recoverySession.id,
      backupFilename,
      error: error.message,
      stepsCompleted: recoverySession.steps.filter(s => s.status === 'completed').length
    });

    throw error;
  }
};

// Rollback to recovery point
export const rollbackRecovery = async (recoveryPointFilename) => {
  try {
    logger.info('Starting recovery rollback', { recoveryPoint: recoveryPointFilename });

    const result = await restoreDatabase(recoveryPointFilename);

    // Verify rollback success
    const integrityResult = await verifyDatabaseIntegrity();

    if (integrityResult.status !== 'healthy') {
      logger.warn('Rollback completed but integrity issues detected', {
        recoveryPoint: recoveryPointFilename,
        issues: integrityResult.issues
      });
    }

    logger.info('Recovery rollback completed', {
      recoveryPoint: recoveryPointFilename,
      integrityStatus: integrityResult.status
    });

    return {
      success: true,
      recoveryPoint: recoveryPointFilename,
      integrityCheck: integrityResult,
      rolledBackAt: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Recovery rollback failed', {
      recoveryPoint: recoveryPointFilename,
      error: error.message
    });
    throw error;
  }
};

// Get recovery history and available recovery points
export const getRecoveryHistory = () => {
  try {
    const backups = listBackups();
    const recoveryPoints = backups.filter(backup =>
      backup.filename.includes('recovery-point')
    );

    const regularBackups = backups.filter(backup =>
      !backup.filename.includes('recovery-point')
    );

    return {
      recoveryPoints: recoveryPoints.map(point => ({
        filename: point.filename,
        createdAt: point.createdAt,
        size: point.sizeMB
      })),
      availableBackups: regularBackups.map(backup => ({
        filename: backup.filename,
        createdAt: backup.createdAt,
        size: backup.sizeMB
      })),
      totalRecoveryPoints: recoveryPoints.length,
      totalBackups: regularBackups.length
    };
  } catch (error) {
    logger.error('Failed to get recovery history', { error: error.message });
    throw error;
  }
};

// Emergency recovery mode (minimal validation)
export const emergencyRecovery = async (backupFilename) => {
  try {
    logger.warn('Initiating emergency recovery mode', { backupFilename });

    // Skip validation and recovery point creation
    const result = await restoreDatabase(backupFilename);

    logger.warn('Emergency recovery completed - manual verification required', {
      backupFilename,
      restoredAt: new Date().toISOString()
    });

    return {
      success: true,
      mode: 'emergency',
      backupFilename,
      restoredAt: new Date().toISOString(),
      warning: 'Emergency recovery completed. Manual verification and integrity check required.'
    };

  } catch (error) {
    logger.error('Emergency recovery failed', {
      backupFilename,
      error: error.message
    });
    throw error;
  }
};
