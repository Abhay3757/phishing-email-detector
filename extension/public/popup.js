// popup.js - Script for the extension popup

document.addEventListener('DOMContentLoaded', function() {
    // Check backend status
    checkBackendStatus();
    
    // Load saved API key
    loadApiKey();
    
    // Setup save button event listener
    document.getElementById('save-key').addEventListener('click', saveApiKey);

    // Check if we have any recent scan results
    chrome.storage.local.get(['lastScanResult'], (result) => {
      if (result.lastScanResult) {
        displayLastResult(result.lastScanResult);
      }
    });

    // Add scan button handler
    document.getElementById('scanButton')?.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url.includes('mail.google.com')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['emailScanner.js']
        });
      } else {
        document.getElementById('result').innerHTML = 'Please open a Gmail message first.';
      }
    });
  });
  
  function checkBackendStatus() {
    const backendStatusElement = document.getElementById('backend-status');
    const apiStatusElement = document.getElementById('api-status');
    
    // Check backend health
    fetch('http://localhost:5000/api/health')
      .then(response => {
        if (response.ok) {
          backendStatusElement.textContent = 'Connected';
          backendStatusElement.style.color = '#0f9d58'; // Green
          return true;
        } else {
          throw new Error('Backend not responding properly');
        }
      })
      .then(backendOk => {
        // If backend is ok, check if API key is configured
        if (backendOk) {
          return chrome.storage.local.get(['geminiApiKey'])
            .then(result => {
              if (result.geminiApiKey) {
                apiStatusElement.textContent = 'Configured';
                apiStatusElement.style.color = '#0f9d58'; // Green
              } else {
                apiStatusElement.textContent = 'Not Configured';
                apiStatusElement.style.color = '#ea4335'; // Red
              }
            });
        }
      })
      .catch(error => {
        console.error('Error checking backend status:', error);
        backendStatusElement.textContent = 'Not Connected';
        backendStatusElement.style.color = '#ea4335'; // Red
        
        apiStatusElement.textContent = 'Backend Required';
        apiStatusElement.style.color = '#ea4335'; // Red
      });
  }
  
  function loadApiKey() {
    chrome.storage.local.get(['geminiApiKey'], function(result) {
      if (result.geminiApiKey) {
        document.getElementById('api-key').value = result.geminiApiKey;
      }
    });
  }
  
  function saveApiKey() {
    const apiKey = document.getElementById('api-key').value.trim();
    
    if (!apiKey) {
      alert('Please enter a valid API key');
      return;
    }
    
    chrome.storage.local.set({ geminiApiKey: apiKey }, function() {
      // Update status indicators
      const apiStatusElement = document.getElementById('api-status');
      apiStatusElement.textContent = 'Configured';
      apiStatusElement.style.color = '#0f9d58'; // Green
      
      // Show success message
      alert('API key saved successfully!');
    });
  }