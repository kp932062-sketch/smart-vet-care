const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use absolute path based on this file's location to avoid cwd issues
const UPLOADS_ROOT = path.join(__dirname, '../uploads');

// Create uploads directory structure
const createUploadDirs = () => {
  const dirs = [
    UPLOADS_ROOT,
    path.join(UPLOADS_ROOT, 'images'),
    path.join(UPLOADS_ROOT, 'documents'),
    path.join(UPLOADS_ROOT, 'reports'),
    path.join(UPLOADS_ROOT, 'prescriptions'),
    path.join(UPLOADS_ROOT, 'licenses'),
    path.join(UPLOADS_ROOT, 'degrees'),
    path.join(UPLOADS_ROOT, 'photos'),
    path.join(UPLOADS_ROOT, 'certificates')
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize directories on module load
createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = UPLOADS_ROOT;

    // Determine subdirectory based on field name or file type
    if (file.fieldname === 'license') {
      uploadPath = path.join(UPLOADS_ROOT, 'licenses');
    } else if (file.fieldname === 'degree') {
      uploadPath = path.join(UPLOADS_ROOT, 'degrees');
    } else if (file.fieldname === 'experience') {
      uploadPath = path.join(UPLOADS_ROOT, 'certificates');
    } else if (file.fieldname === 'photo') {
      uploadPath = path.join(UPLOADS_ROOT, 'photos');
    } else if (file.fieldname === 'idProof') {
      uploadPath = path.join(UPLOADS_ROOT, 'documents');
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(UPLOADS_ROOT, 'images');
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = path.join(UPLOADS_ROOT, 'documents');
    } else {
      uploadPath = path.join(UPLOADS_ROOT, 'documents');
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${baseName}_${uniqueSuffix}${extension}`);
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 5
  },
  fileFilter
});

module.exports = {
  single: upload.single('file'),
  multiple: upload.array('files', 5),
  fields: upload.fields([
    { name: 'images', maxCount: 3 },
    { name: 'documents', maxCount: 2 }
  ]),
  doctorDocuments: upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'degree', maxCount: 1 },
    { name: 'experience', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'idProof', maxCount: 1 }
  ])
};