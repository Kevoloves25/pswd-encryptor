// Decryption page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const encryptedInput = document.getElementById('encrypted-input');
    const encryptedFileUpload = document.getElementById('encrypted-file-upload');
    const encryptedFileName = document.getElementById('encrypted-file-name');
    const decryptPassword = document.getElementById('decrypt-password');
    const decryptBtn = document.getElementById('decrypt-btn');
    const decryptedOutput = document.getElementById('decrypted-output');
    const copyDecryptedBtn = document.getElementById('copy-decrypted');
    const downloadDecryptedBtn = document.getElementById('download-decrypted');
    const decryptedLanguage = document.getElementById('decrypted-language');
    const outputSection = document.querySelector('.output-section');

    // File upload handling for encrypted files
    encryptedFileUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            encryptedFileName.textContent = file.name;
            
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                encryptedFileUpload.value = '';
                encryptedFileName.textContent = 'No file selected';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                encryptedInput.value = e.target.result;
            };
            reader.readAsText(file);
        }
    });

    // Decryption
    decryptBtn.addEventListener('click', async function() {
        const encryptedData = encryptedInput.value.trim();
        const password = decryptPassword.value;
        
        if (!encryptedData) {
            alert('Please enter or upload encrypted code');
            return;
        }
        
        if (!password) {
            alert('Please enter the decryption password');
            return;
        }
        
        try {
            decryptBtn.disabled = true;
            decryptBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Decrypting...';
            
            // Decrypt the code
            const decrypted = await CryptoUtils.decrypt(encryptedData, password);
            
            if (!decrypted) {
                throw new Error('Decryption failed. Please check your password.');
            }
            
            decryptedOutput.textContent = decrypted;
            
            // Apply syntax highlighting
            if (window.hljs) {
                const language = decryptedLanguage.value === 'auto' ? 
                    detectLanguage(decrypted) : decryptedLanguage.value;
                const highlighted = window.hljs.highlight(decrypted, { 
                    language: language || 'plaintext' 
                }).value;
                decryptedOutput.innerHTML = highlighted;
            }
            
            // Show output section
            outputSection.classList.remove('hidden');
            
            // Update stats
            await fetch('/api/stats/decrypted', { method: 'POST' });
            
            showNotification('Code decrypted successfully!');
            
        } catch (error) {
            console.error('Decryption error:', error);
            alert('Decryption failed: ' + error.message);
        } finally {
            decryptBtn.disabled = false;
            decryptBtn.innerHTML = '<i class="fas fa-unlock"></i> Decrypt Code';
        }
    });

    // Copy decrypted code
    copyDecryptedBtn.addEventListener('click', function() {
        const decryptedText = decryptedOutput.textContent;
        if (decryptedText) {
            copyToClipboard(decryptedText);
        }
    });

    // Download decrypted file
    downloadDecryptedBtn.addEventListener('click', function() {
        const decryptedText = decryptedOutput.textContent;
        if (decryptedText) {
            const fileName = `decrypted-code-${Date.now()}.txt`;
            downloadFile(decryptedText, fileName, 'text/plain');
            showNotification('Decrypted file downloaded!');
        }
    });

    // Language detection for syntax highlighting
    function detectLanguage(code) {
        if (code.includes('function') && (code.includes('{') || code.includes('=>'))) {
            return 'javascript';
        } else if (code.includes('def ') && code.includes(':')) {
            return 'python';
        } else if (code.includes('<?php') || code.includes('$')) {
            return 'php';
        } else if (code.includes('<html') || code.includes('<div')) {
            return 'html';
        } else if (code.includes('public class') || code.includes('import java')) {
            return 'java';
        } else if (code.includes('#include') || code.includes('std::')) {
            return 'cpp';
        }
        return 'plaintext';
    }

    // Update syntax highlighting when language changes
    decryptedLanguage.addEventListener('change', function() {
        if (outputSection.classList.contains('hidden')) return;
        
        const decryptedText = decryptedOutput.textContent;
        if (decryptedText && window.hljs) {
            const language = this.value === 'auto' ? 
                detectLanguage(decryptedText) : this.value;
            const highlighted = window.hljs.highlight(decryptedText, { 
                language: language || 'plaintext' 
            }).value;
            decryptedOutput.innerHTML = highlighted;
        }
    });
});
