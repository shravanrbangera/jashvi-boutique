const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { config } = require('../../config/env');

class LocalStorageAdapter {
  constructor(uploadBaseDir) {
    this.uploadBaseDir = uploadBaseDir;
    // Ensure base directory exists
    if (!fs.existsSync(this.uploadBaseDir)) {
      fs.mkdirSync(this.uploadBaseDir, { recursive: true });
    }
  }

  async saveFile(fileBuffer, originalFilename, mimeType, subfolder = 'products') {
    const targetFolder = path.join(this.uploadBaseDir, subfolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
    const safeBaseName = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30);
    const uniqueName = `${Date.now()}-${uuidv4().slice(0, 8)}-${safeBaseName}${ext}`;
    const destinationPath = path.join(targetFolder, uniqueName);

    await fs.promises.writeFile(destinationPath, fileBuffer);

    // Return the relative URL served by Express static middleware
    const publicUrl = `/uploads/${subfolder}/${uniqueName}`;
    return {
      success: true,
      provider: 'local',
      publicUrl,
      storageKey: path.join(subfolder, uniqueName).replace(/\\/g, '/'),
      bytes: fileBuffer.length,
      mimeType,
    };
  }

  async deleteFile(storageKey) {
    try {
      const fullPath = path.join(this.uploadBaseDir, storageKey);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
      return { success: true };
    } catch (err) {
      console.warn(`[LocalStorage] Failed to delete file: ${storageKey}`, err.message);
      return { success: false, error: err.message };
    }
  }
}

class CloudinaryStorageAdapter {
  constructor(credentials) {
    this.credentials = credentials;
    // Lazy-load cloudinary if available
    try {
      this.cloudinary = require('cloudinary').v2;
      this.cloudinary.config({
        cloud_name: credentials.cloudName,
        api_key: credentials.apiKey,
        api_secret: credentials.apiSecret,
      });
      this.isConfigured = true;
    } catch {
      this.isConfigured = false;
    }
  }

  async saveFile(fileBuffer, originalFilename, mimeType, subfolder = 'products') {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured properly with API credentials.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: `jashvi-boutique/${subfolder}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            success: true,
            provider: 'cloudinary',
            publicUrl: result.secure_url,
            storageKey: result.public_id,
            bytes: result.bytes,
            mimeType,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  async deleteFile(storageKey) {
    if (!this.isConfigured) return { success: false, error: 'Cloudinary not configured' };
    try {
      const result = await this.cloudinary.uploader.destroy(storageKey);
      return { success: result.result === 'ok' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// Instantiate active adapter based on environment configuration
let activeAdapter;
if (config.storage.isCloudinaryActive && config.storage.mode === 'cloudinary') {
  activeAdapter = new CloudinaryStorageAdapter(config.storage.cloudinary);
  console.log('[StorageService] Initialized with Cloudinary cloud storage adapter.');
} else {
  activeAdapter = new LocalStorageAdapter(config.storage.localUploadDir);
  console.log('[StorageService] Initialized with safe LocalStorageAdapter for local development.');
}

module.exports = {
  storageService: activeAdapter,
  LocalStorageAdapter,
  CloudinaryStorageAdapter,
};
