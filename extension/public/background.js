chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("mail.google.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['emailScanner.js']
    });
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCAN_RESULT') {
    // Handle scan results
    chrome.storage.local.set({ 'lastScanResult': request.data });
  }
});