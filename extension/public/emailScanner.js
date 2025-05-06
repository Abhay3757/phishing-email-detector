function scanGmailEmail() {
  // Get the email content
  const emailContainer = document.querySelector('.a3s.aiL');
  if (!emailContainer) {
    console.error('Email content not found');
    return;
  }

  const emailContent = emailContainer.textContent;
  
  // Create or update the scan button
  let scanButton = document.querySelector('.phishing-scan-btn');
  if (!scanButton) {
    scanButton = document.createElement('button');
    scanButton.className = 'phishing-scan-btn';
    scanButton.style.cssText = `
      background-color: #1a73e8;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin: 8px 0;
      font-family: 'Google Sans',Roboto,Arial,sans-serif;
    `;
    emailContainer.parentNode.insertBefore(scanButton, emailContainer);
  }
  
  scanButton.textContent = '🔍 Scan for Phishing';
  scanButton.disabled = false;

  // Add click handler
  scanButton.onclick = async () => {
    try {
      scanButton.textContent = 'Analyzing...';
      scanButton.disabled = true;

      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_body: emailContent })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      displayResults(emailContainer, data);

      // Send results to background script
      chrome.runtime.sendMessage({
        type: 'SCAN_RESULT',
        data: data
      });

    } catch (error) {
      console.error('Error:', error);
      displayError(emailContainer, error.message);
    } finally {
      scanButton.textContent = '🔍 Scan for Phishing';
      scanButton.disabled = false;
    }
  };
}

function displayResults(container, data) {
  let resultDiv = document.querySelector('.phishing-result');
  if (!resultDiv) {
    resultDiv = document.createElement('div');
    resultDiv.className = 'phishing-result';
    container.parentNode.insertBefore(resultDiv, container);
  }

  const riskLevel = data.content_analysis?.phishing_likelihood?.toLowerCase() || 'unknown';
  resultDiv.className = `phishing-result ${riskLevel}`;
  
  resultDiv.innerHTML = `
    <div style="padding: 16px; border-radius: 8px; margin: 8px 0; border: 1px solid #ccc;">
      <h3 style="margin: 0 0 8px 0;">Phishing Analysis Result</h3>
      <p><strong>Risk Level:</strong> ${data.content_analysis?.phishing_likelihood || 'Unknown'}</p>
      <p><strong>Explanation:</strong> ${data.content_analysis?.explanation || 'No explanation provided'}</p>
      ${data.content_analysis?.suspicious_elements?.length ? 
        `<p><strong>Suspicious Elements:</strong></p>
         <ul>${data.content_analysis.suspicious_elements.map(el => `<li>${el}</li>`).join('')}</ul>` 
        : ''}
    </div>
  `;
}

function displayError(container, message) {
  let resultDiv = document.querySelector('.phishing-result');
  if (!resultDiv) {
    resultDiv = document.createElement('div');
    resultDiv.className = 'phishing-result error';
    container.parentNode.insertBefore(resultDiv, container);
  }
  
  resultDiv.innerHTML = `
    <div style="padding: 16px; border-radius: 8px; margin: 8px 0; border: 1px solid #f44336; background: #ffebee;">
      <h3 style="margin: 0 0 8px 0; color: #f44336;">Error</h3>
      <p>${message}</p>
    </div>
  `;
}

// Run the scanner
scanGmailEmail();