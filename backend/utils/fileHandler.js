const fs = require('fs');
const path = require('path');

class FileHandler {
  static saveEncryptedFile(encryptedData, originalFileName) {
    const uploadsDir = path.join(__dirname, '../data/uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const fileName = `encrypted-${Date.now()}-${originalFileName}.enc`;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, encryptedData);
    
    return {
      fileName: fileName,
      filePath: filePath,
      downloadUrl: `/api/download/${fileName}`
    };
  }
  
  static getFile(fileName) {
    const filePath = path.join(__dirname, '../data/uploads', fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    return {
      path: filePath,
      content: fs.readFileSync(filePath, 'utf8')
    };
  }
  
  static cleanupOldFiles(maxAgeHours = 24) {
    const uploadsDir = path.join(__dirname, '../data/uploads');
    
    if (!fs.existsSync(uploadsDir)) return;
    
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

module.exports = FileHandler;
