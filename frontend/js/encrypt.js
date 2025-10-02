// Encryption page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const codeInput = document.getElementById('code-input');
    const fileUpload = document.getElementById('file-upload');
    const fileName = document.getElementById('file-name');
    const languageSelect = document.getElementById('language');
    const clearCodeBtn = document.getElementById('clear-code');
    const encryptPassword = document.getElementById('encrypt-password');
    const generatePasswordBtn = document.getElementById('generate-password');
    const encryptBtn = document.getElementById('encrypt-btn');
    const encryptedOutput = document.getElementById('encrypted-output');
    const copyEncryptedBtn = document.getElementById('copy-encrypted');
    const downloadEncryptedBtn = document.getElementById('download-encrypted');
    const outputSection = document.querySelector('.output-section');

    // File upload handling
    fileUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
            
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                fileUpload.value = '';
                fileName.textContent = 'No file selected';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                codeInput.value = e.target.result;
                
                // Auto-detect language from file extension
                const extension = file.name.split('.').pop().toLowerCase();
                const languageMap = {
                    'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript',
                    'py': 'python', 'html': 'html', 'css': 'css',
                    'java': 'java', 'cpp': 'cpp', 'c': 'c',
                    'php': 'php', 'rb': 'ruby', 'go': 'go',
                    'rs': 'rust', 'swift': 'swift', 'kt': 'kotlin'
                };
                
                if (languageMap[extension]) {
                    languageSelect.value = languageMap[extension];
                }
            };
            reader.readAsText(file);
        }
    });

    // Clear code
    clearCodeBtn.addEventListener('click', function() {
        codeInput.value = '';
        fileUpload.value = '';
        fileName.textContent = 'No file selected';
    });

    // Generate strong password
    generatePasswordBtn.addEventListener('click', function() {
        const strongPassword = CryptoUtils.generateStrongPassword();
        encryptPassword.value = strongPassword;
        updatePasswordStrength(strongPassword);
    });

    // Password strength indicator
    encryptPassword.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });

    // Encryption
    encryptBtn.addEventListener('click', async function() {
        const code = codeInput.value.trim();
        const password = encryptPassword.value;
        
        if (!code) {
            alert('Please enter or upload code to encrypt');
            return;
        }
        
        if (!password) {
            alert('Please enter an encryption password');
            return;
        }
        
        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        
        try {
            encryptBtn.disabled = true;
            encryptBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encrypting...';
            
            // Encrypt the code
            const encrypted = await CryptoUtils.encrypt(code, password);
            encryptedOutput.textContent = encrypted;
            
            // Show output section
            outputSection.classList.remove('hidden');
            
            // Update stats
            await fetch('/api/stats/encrypted', { method: 'POST' });
            
            showNotification('Code encrypted successfully!');
            
        } catch (error) {
            console.error('Encryption error:', error);
            alert('Encryption failed: ' + error.message);
        } finally {
            encryptBtn.disabled = false;
            encryptBtn.innerHTML = '<i class="fas fa-lock"></i> Encrypt Code';
        }
    });

    // Copy encrypted code
    copyEncryptedBtn.addEventListener('click', function() {
        const encryptedText = encryptedOutput.textContent;
        if (encryptedText) {
            copyToClipboard(encryptedText);
        }
    });

    // Download encrypted file
    downloadEncryptedBtn.addEventListener('click', function() {
        const encryptedText = encryptedOutput.textContent;
        if (encryptedText) {
            const fileName = `encrypted-code-${Date.now()}.enc`;
            downloadFile(encryptedText, fileName, 'text/plain');
            showNotification('Encrypted file downloaded!');
        }
    });
});
