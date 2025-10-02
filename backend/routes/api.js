const express = require('express');
const EncryptionService = require('../utils/encryption');
const router = express.Router();

// Encrypt endpoint
router.post('/encrypt', (req, res) => {
  try {
    const { code, password } = req.body;
    
    if (!code || !password) {
      return res.status(400).json({ error: 'Code and password are required' });
    }
    
    const encryptedData = EncryptionService.encrypt(code, password);
    
    res.json({
      success: true,
      encryptedData: encryptedData,
      message: 'Code encrypted successfully'
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Encryption failed: ' + error.message });
  }
});

// Decrypt endpoint
router.post('/decrypt', (req, res) => {
  try {
    const { encryptedData, password } = req.body;
    
    if (!encryptedData || !password) {
      return res.status(400).json({ error: 'Encrypted data and password are required' });
    }
    
    const decryptedCode = EncryptionService.decrypt(encryptedData, password);
    
    res.json({
      success: true,
      decryptedCode: decryptedCode,
      message: 'Code decrypted successfully'
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Decryption failed: ' + error.message });
  }
});

// Generate password endpoint
router.get('/generate-password', (req, res) => {
  try {
    const length = parseInt(req.query.length) || 16;
    const password = EncryptionService.generateStrongPassword(length);
    
    res.json({
      success: true,
      password: password
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Password generation failed' });
  }
});

module.exports = router;
