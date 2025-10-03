// Encrypt code - Updated version
encryptBtn.addEventListener('click', async function() {
    const code = codeInput.value.trim();
    const password = encryptPassword.value;
    
    if (!code) {
        showNotification('Please enter or upload code to encrypt', 'warning');
        return;
    }
    
    if (!password) {
        showNotification('Please enter an encryption password', 'warning');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password should be at least 8 characters long', 'warning');
        return;
    }
    
    try {
        encryptBtn.disabled = true;
        encryptBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encrypting...';
        
        // Use frontend encryption (more secure - password never leaves browser)
        const encryptedData = await CryptoUtils.encrypt(code, password);
        
        encryptedOutput.textContent = encryptedData;
        outputSection.classList.remove('hidden');
        
        // Update stats on backend
        try {
            await fetch('/api/stats/encrypted', { method: 'POST' });
        } catch (statsError) {
            console.warn('Could not update stats:', statsError);
        }
        
        showNotification('Code encrypted successfully!', 'success');
        
        // Scroll to output
        outputSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        showNotification('Error encrypting code: ' + error.message, 'error');
    } finally {
        encryptBtn.disabled = false;
        encryptBtn.innerHTML = '<i class="fas fa-lock"></i> Encrypt Code';
    }
});
