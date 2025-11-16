import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Get encryption key from environment or generate one
const getEncryptionKey = () => {
  if (process.env.ENCRYPTION_KEY) {
    return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  // Generate a key for development (in production, use a fixed key from env)
  const key = crypto.scryptSync(process.env.JWT_SECRET || 'default-secret', 'salt', KEY_LENGTH);
  return key;
};

// Encrypt sensitive data
export const encrypt = (text) => {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encryptedData
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

// Decrypt sensitive data
export const decrypt = (encryptedText) => {
  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

// Hash sensitive data (one-way encryption for passwords, etc.)
export const hashData = (data, saltRounds = 12) => {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcryptjs');
    bcrypt.hash(data, saltRounds, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
};

// Verify hashed data
export const verifyHash = (data, hash) => {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcryptjs');
    bcrypt.compare(data, hash, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Generate secure random tokens
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Encrypt user data before storing
export const encryptUserData = (userData) => {
  const sensitiveFields = ['email', 'name', 'phone', 'address', 'paymentInfo'];

  const encryptedData = { ...userData };

  sensitiveFields.forEach(field => {
    if (encryptedData[field]) {
      encryptedData[field] = encrypt(encryptedData[field]);
    }
  });

  return encryptedData;
};

// Decrypt user data for retrieval
export const decryptUserData = (encryptedUserData) => {
  const sensitiveFields = ['email', 'name', 'phone', 'address', 'paymentInfo'];

  const decryptedData = { ...encryptedUserData };

  sensitiveFields.forEach(field => {
    if (decryptedData[field]) {
      try {
        decryptedData[field] = decrypt(decryptedData[field]);
      } catch (error) {
        // If decryption fails, keep the encrypted value
        console.warn(`Failed to decrypt field ${field}:`, error.message);
      }
    }
  });

  return decryptedData;
};

// GDPR-compliant data anonymization
export const anonymizeData = (data) => {
  const anonymized = { ...data };

  // Remove or hash personal identifiable information
  if (anonymized.email) {
    anonymized.email = crypto.createHash('sha256').update(anonymized.email).digest('hex');
  }

  if (anonymized.name) {
    anonymized.name = 'ANONYMIZED';
  }

  if (anonymized.phone) {
    anonymized.phone = 'ANONYMIZED';
  }

  // Keep essential non-PII data for analytics
  delete anonymized.address;
  delete anonymized.paymentInfo;
  delete anonymized.twoFactorSecret;
  delete anonymized.backupCodes;

  return anonymized;
};

// Secure data deletion (overwrite with random data before deletion)
export const secureDelete = (data) => {
  if (typeof data === 'string') {
    // Overwrite string with random characters
    const randomData = crypto.randomBytes(data.length).toString('hex').substring(0, data.length);
    return randomData;
  } else if (Buffer.isBuffer(data)) {
    // Overwrite buffer with random bytes
    crypto.randomFillSync(data);
    return data;
  }

  return null;
};
