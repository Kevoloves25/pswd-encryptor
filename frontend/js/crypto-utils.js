// Crypto utilities for client-side encryption/decryption
// Note: In a production environment, consider using Web Crypto API

class CryptoUtils {
    static async encrypt(text, password) {
        try {
            // Generate salt and IV
            const salt = CryptoJS.lib.WordArray.random(128/8);
            const iv = CryptoJS.lib.WordArray.random(128/8);
            
            // Derive key from password
            const key = CryptoJS.PBKDF2(password, salt, {
                keySize: 256/32,
                iterations: 1000
            });
            
            // Encrypt the text
            const encrypted = CryptoJS.AES.encrypt(text, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            // Combine salt + iv + encrypted data
            const combined = salt.toString() + iv.toString() + encrypted.toString();
            return combined;
            
        } catch (error) {
            throw new Error('Encryption failed: ' + error.message);
        }
    }

    static async decrypt(encryptedData, password) {
        try {
            // Extract components (salt: 32 chars, iv: 32 chars, rest: encrypted data)
            const salt = CryptoJS.enc.Hex.parse(encryptedData.substring(0, 32));
            const iv = CryptoJS.enc.Hex.parse(encryptedData.substring(32, 64));
            const encrypted = encryptedData.substring(64);
            
            // Derive key from password
            const key = CryptoJS.PBKDF2(password, salt, {
                keySize: 256/32,
                iterations: 1000
            });
            
            // Decrypt the data
            const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            return decrypted.toString(CryptoJS.enc.Utf8);
            
        } catch (error) {
            throw new Error('Decryption failed. Please check your password.');
        }
    }

    static generateStrongPassword(length = 16) {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        const allChars = uppercase + lowercase + numbers + symbols;
        
        let password = '';
        
        // Ensure at least one of each type
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
        
        // Fill the rest
        for (let i = password.length; i < length; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    static checkPasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return Math.min(strength, 5); // Max strength of 5
    }
}

// Password strength indicator
function updatePasswordStrength(password) {
    const strength = CryptoUtils.checkPasswordStrength(password);
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    
    if (!strengthFill || !strengthText) return;
    
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['#dc3545', '#ff6b6b', '#ffc107', '#51cf66', '#2b8a3e', '#1c7ed6'];
    
    strengthFill.style.width = `${(strength / 5) * 100}%`;
    strengthFill.style.backgroundColor = strengthColors[strength];
    strengthText.textContent = strengthLabels[strength];
}
