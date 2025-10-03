// Decrypt code - Updated version
decryptBtn.addEventListener('click', async function() {
    const encryptedData = encryptedInput.value.trim();
    const password = decryptPassword.value;
    
    if (!encryptedData) {
        showNotification('Please enter or upload encrypted code', 'warning');
        return;
    }
    
    if (!password) {
        showNotification('Please enter the decryption password', 'warning');
        return;
    }
    
    try {
        decryptBtn.disabled = true;
        decryptBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Decrypting...';
        
        // Use frontend decryption (more secure - password never leaves browser)
        const decryptedCode = await CryptoUtils.decrypt(encryptedData, password);
        
        decryptedOutput.textContent = decryptedCode;
        
        // Apply syntax highlighting
        if (typeof hljs !== 'undefined') {
            hljs.highlightElement(decryptedOutput);
        }
        
        outputSection.classList.remove('hidden');
        
        // Update stats on backend
        try {
            await fetch('/api/stats/decrypted', { method: 'POST' });
        } catch (statsError) {
            console.warn('Could not update stats:', statsError);
        }
        
        showNotification('Code decrypted successfully!', 'success');
        
        // Scroll to output
        outputSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        showNotification('Error decrypting code: ' + error.message, 'error');
    } finally {
        decryptBtn.disabled = false;
        decryptBtn.innerHTML = '<i class="fas fa-unlock"></i> Decrypt Code';
    }
});
