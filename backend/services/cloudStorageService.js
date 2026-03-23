const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for documents
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vetcare-documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `${req.body.documentType || 'document'}_${timestamp}_${originalName}`;
    },
    resource_type: 'auto' // Automatically detect file type
  }
});


// Alternative: AWS S3 Storage (only initialize if STORAGE_TYPE is 's3' and all env vars are present)
let s3 = null;
let s3Storage = null;
if (process.env.STORAGE_TYPE === 's3' && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.AWS_S3_BUCKET_NAME) {
  const AWS = require('aws-sdk');
  const multerS3 = require('multer-s3');
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  s3Storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const timestamp = Date.now();
      const folder = req.body.documentType || 'documents';
      const fileName = `${folder}/${timestamp}_${file.originalname}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  });
}

// Upload middleware for different storage options
const createUploadMiddleware = (storageType = 'cloudinary') => {
  let storage;
  if (storageType === 's3' && s3Storage) {
    storage = s3Storage;
  } else {
    storage = cloudinaryStorage;
  }
  return multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Allowed file types for doctor documents
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX are allowed.'), false);
      }
    }
  });
};

// Document upload handler
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documentData = {
      filename: req.file.filename || req.file.key,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: req.file.path || req.file.location, // Cloudinary uses path, S3 uses location
      cloudinaryId: req.file.public_id, // Only for Cloudinary
      uploadedAt: new Date(),
      documentType: req.body.documentType,
      uploadedBy: req.user,
      status: 'pending_verification'
    };

    // Save document metadata to database
    const Document = require('../models/Document');
    const document = new Document(documentData);
    await document.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: documentData
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ 
      error: 'Document upload failed', 
      details: error.message 
    });
  }
};

// Delete document from cloud storage
const deleteDocument = async (documentId, cloudinaryPublicId) => {
  try {
    if (process.env.STORAGE_TYPE === 's3' && s3) {
      // Delete from S3
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: documentId
      }).promise();
    } else {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(cloudinaryPublicId);
    }
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
};

// Get signed URL for private documents (S3 only)
const getSignedUrl = (documentKey, expiresIn = 3600) => {
  if (process.env.STORAGE_TYPE === 's3' && s3) {
    return s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: documentKey,
      Expires: expiresIn // 1 hour by default
    });
  }
  return null;
};

module.exports = {
  createUploadMiddleware,
  uploadDocument,
  deleteDocument,
  getSignedUrl,
  cloudinary,
  s3
};