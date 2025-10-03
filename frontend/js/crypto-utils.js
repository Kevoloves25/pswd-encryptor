// Frontend encryption utilities using Web Crypto API
class CryptoUtils {
    static async encrypt(text, password) {
        try {
            // Generate a random salt
            const salt = crypto.getRandomValues(new Uint8Array(16));
            
            // Derive key from password
            const keyMaterial = await this.getKeyMaterial(password);
            const key = await this.deriveKey(keyMaterial, salt, ['encrypt']);
            
            // Generate random IV
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Encrypt the text
            const encoder = new TextEncoder();
            const encodedText = encoder.encode(text);
            
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encodedText
            );
            
            // Combine salt + iv + encrypted data
            const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encrypted), salt.length + iv.length);
            
            // Convert to base64 for storage
            return btoa(String.fromCharCode(...combined));
            
        } catch (error) {
            throw new Error('Encryption failed: ' + error.message);
        }
    }

    static async decrypt(encryptedData, password) {
        try {
            // Convert from base64
            const binaryString = atob(encryptedData);
            const combined = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                combined[i] = binaryString.charCodeAt(i);
            }
            
            // Extract salt (first 16 bytes), iv (next 12 bytes), and encrypted data
            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 28);
            const encrypted = combined.slice(28);
            
            // Derive key from password
            const keyMaterial = await this.getKeyMaterial(password);
            const key = await this.deriveKey(keyMaterial, salt, ['decrypt']);
            
            // Decrypt the data
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encrypted
            );
            
            // Convert back to text
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
            
        } catch (error) {
            throw new Error('Decryption failed: ' + error.message);
        }
    }

    static async getKeyMaterial(password) {
        const encoder = new TextEncoder();
        return crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
    }

    static async deriveKey(keyMaterial, salt, keyUsages) {
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            keyUsages
        );
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

    static checkPasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return {
            score: strength,
            maxScore: 6,
            text: this.getStrengthText(strength),
            color: this.getStrengthColor(strength),
            width: this.getStrengthWidth(strength)
        };
    }

    static getStrengthText(strength) {
        const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'];
        return texts[Math.min(strength, 6)];
    }

    static getStrengthColor(strength) {
        const colors = ['#dc3545', '#dc3545', '#ffc107', '#ffc107', '#28a745', '#28a745', '#28a745'];
        return colors[Math.min(strength, 6)];
    }

    static getStrengthWidth(strength) {
        const widths = ['20%', '20%', '40%', '60%', '80%', '95%', '100%'];
        return widths[Math.min(strength, 6)];
    }
}

// Fallback for browsers without Web Crypto API
if (typeof crypto === 'undefined' || !crypto.subtle) {
    console.warn('Web Crypto API not available, using fallback');
    
    // Simple XOR fallback (NOT SECURE - for demo only)
    CryptoUtils.encrypt = async function(text, password) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ password.charCodeAt(i % password.length));
        }
        return btoa(result);
    };
    
    CryptoUtils.decrypt = async function(encryptedData, password) {
        const text = atob(encryptedData);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ password.charCodeAt(i % password.length));
        }
        return result;
    };
}
