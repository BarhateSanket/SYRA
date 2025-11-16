#!/bin/bash

# SYRA AI - Automated MongoDB Backup Script
# This script creates backups of the MongoDB database and manages retention

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="syra_backup_${TIMESTAMP}"
RETENTION_DAYS=30

# MongoDB connection details (from environment variables)
MONGO_HOST=${MONGO_HOST:-"mongodb"}
MONGO_PORT=${MONGO_PORT:-"27017"}
MONGO_USER=${MONGO_USER:-"admin"}
MONGO_PASS=${MONGO_PASS:-"password123"}
MONGO_DB=${MONGO_DB:-"syra_ai"}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting MongoDB backup: $BACKUP_NAME"

# Create backup using mongodump
mongodump \
  --host "$MONGO_HOST" \
  --port "$MONGO_PORT" \
  --username "$MONGO_USER" \
  --password "$MONGO_PASS" \
  --db "$MONGO_DB" \
  --out "$BACKUP_DIR/$BACKUP_NAME"

# Compress the backup
echo "Compressing backup..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR/$BACKUP_NAME"

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" | cut -f1)

echo "Backup completed: $BACKUP_NAME.tar.gz (Size: $BACKUP_SIZE)"

# Clean up old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "syra_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Verify backup integrity
echo "Verifying backup integrity..."
if tar -tzf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" > /dev/null; then
    echo "Backup verification successful"
else
    echo "ERROR: Backup verification failed!"
    exit 1
fi

# Upload to cloud storage (optional - uncomment and configure)
# aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" "s3://your-backup-bucket/${BACKUP_NAME}.tar.gz"

echo "Backup process completed successfully"

# Log backup information
echo "$(date): Backup $BACKUP_NAME completed (Size: $BACKUP_SIZE)" >> "$BACKUP_DIR/backup.log"
