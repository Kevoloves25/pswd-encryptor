const CryptoJS = require('crypto-js');

class EncryptionService {
  static encrypt(text, password) {
    try {
      const salt = CryptoJS.lib.WordArray.random(128/8);
      const key = CryptoJS.PBKDF2(password, salt, { keySize: 256/32, iterations: 1000 });
      const iv = CryptoJS.lib.WordArray.random(128/8);
      
      const encrypted = CryptoJS.AES.encrypt(text, key, { 
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Combine salt, iv, and encrypted data
      const combined = salt.toString() + iv.toString() + encrypted.toString();
      return combined;
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  static decrypt(encryptedData, password) {
    try {
      // Extract salt (first 32 chars)
      const salt = CryptoJS.enc.Hex.parse(encryptedData.substring(0, 32));
      // Extract iv (next 32 chars)
      const iv = CryptoJS.enc.Hex.parse(encryptedData.substring(32, 64));
      // Extract encrypted content (rest)
      const encrypted = encryptedData.substring(64);
      
      const key = CryptoJS.PBKDF2(password, salt, { keySize: 256/32, iterations: 1000 });
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  static generateStrongPassword(length = 16) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one of each type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26));
    password += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 26));
    password += "0123456789".charAt(Math.floor(Math.random() * 10));
    password += "!@#$%^&*".charAt(Math.floor(Math.random() * 8));
    
    // Fill the rest
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

module.exports = EncryptionService;
