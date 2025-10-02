const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../data/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.js', '.py', '.html', '.css', '.jsx', '.ts', '.java', '.cpp', '.c', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.txt'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Handle file upload
router.post('/', upload.single('codeFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Read the uploaded file
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    
    // Return file content and info
    res.json({
      success: true,
      fileName: req.file.originalname,
      fileContent: fileContent,
      fileSize: req.file.size,
      message: 'File uploaded successfully'
    });
    
    // Clean up uploaded file after reading
    fs.unlinkSync(req.file.path);
    
  } catch (error) {
    res.status(500).json({ error: 'Error processing file: ' + error.message });
  }
});

module.exports = router;
