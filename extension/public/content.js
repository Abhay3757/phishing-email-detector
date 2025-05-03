// content.js - This script will be injected into Gmail pages

// Wait for Gmail to fully load
window.addEventListener('load', function() {
    // Give Gmail a moment to initialize
    setTimeout(initializeExtension, 1000);
  });
  
  function initializeExtension() {
    console.log("Phishing detection extension initialized");
    
    // Create the detection button style
    const style = document.createElement('style');
    style.textContent = `
      .phishing-scan-btn {
        background-color: #4285f4;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        margin-right: 10px;
      }
      .phishing-scan-btn:hover {
        background-color: #3367d6;
      }
      .phishing-result {
        margin-top: 10px;
        padding: 12px;
        border-radius: 4px;
        font-size: 14px;
      }
      .phishing-result.high {
        background-color: #ffebee;
        border: 1px solid #f44336;
      }
      .phishing-result.medium {
        background-color: #fff8e1;
        border: 1px solid #ffc107;
      }
      .phishing-result.low {
        background-color: #e8f5e9;
        border: 1px solid #4caf50;
      }
      .phishing-urls {
        margin-top: 10px;
      }
      .phishing-url-item {
        margin-bottom: 8px;
        padding: 8px;
        border-radius: 4px;
      }
      .phishing-url-item.high {
        background-color: #ffebee;
      }
      .phishing-url-item.medium {
        background-color: #fff8e1;
      }
      .phishing-url-item.low {
        background-color: #e8f5e9;
      }
    `;
    document.head.appendChild(style);
    
    // Set up a mutation observer to detect when emails are opened
    setupEmailObserver();
  }
  
  function setupEmailObserver() {
    // Target the main content area of Gmail
    const targetNode = document.body;
    
    // Options for the observer
    const config = { childList: true, subtree: true };
    
    // Create an observer instance
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // Check if email view is loaded
        if (mutation.addedNodes && mutation.addedNodes.length) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1) { // Element node
              // Check if this is an email view
              const emailContainer = node.querySelector('.a4W');
              if (emailContainer) {
                // Look for the email toolbar where we'll inject our button
                const toolbarContainer = document.querySelector('.G-M');
                if (toolbarContainer && !toolbarContainer.querySelector('.phishing-scan-btn')) {
                  addScanButton(toolbarContainer, emailContainer);
                }
              }
            }
          }
        }
      });
    });
    
    // Start observing
    observer.observe(targetNode, config);
  }
  
  function addScanButton(toolbarContainer, emailContainer) {
    // Create scan button
    const scanButton = document.createElement('button');
    scanButton.className = 'phishing-scan-btn';
    scanButton.textContent = '🔍 Scan for Phishing';
    scanButton.title = 'Analyze this email for phishing attempts';
    
    // Add button to toolbar
    toolbarContainer.insertBefore(scanButton, toolbarContainer.firstChild);
    
    // Add click event listener
    scanButton.addEventListener('click', function() {
      scanEmail(emailContainer);
    });
  }
  
  function scanEmail(emailContainer) {
    // Get email body content
    const emailBody = getEmailContent(emailContainer);
    
    if (!emailBody) {
      console.error("Could not extract email content");
      return;
    }
    
    // Show loading state
    const scanButton = document.querySelector('.phishing-scan-btn');
    const originalText = scanButton.textContent;
    scanButton.textContent = 'Analyzing...';
    scanButton.disabled = true;
    
    // Remove any existing result
    const existingResult = document.querySelector('.phishing-result');
    if (existingResult) {
      existingResult.remove();
    }
    
    // Send to backend for analysis
    fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_body: emailBody }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Parse content analysis
      let contentAnalysisData;
      try {
        contentAnalysisData = typeof data.content_analysis === 'string' 
          ? JSON.parse(data.content_analysis.trim()) 
          : data.content_analysis;
      } catch (e) {
        console.error('Error parsing content analysis:', e);
        contentAnalysisData = {
          phishing_likelihood: "Unknown",
          suspicious_elements: [],
          explanation: "Could not parse analysis response"
        };
      }

      // Parse URL analysis
      const parsedUrlAnalysis = {};
      Object.entries(data.url_analysis || {}).forEach(([url, analysis]) => {
        try {
          parsedUrlAnalysis[url] = typeof analysis === 'string' 
            ? JSON.parse(analysis.trim()) 
            : analysis;
        } catch (e) {
          console.error('Error parsing URL analysis:', e);
          parsedUrlAnalysis[url] = {
            suspicious_likelihood: "Unknown",
            suspicious_elements: [],
            explanation: "Could not parse URL analysis"
          };
        }
      });

      // Display results with parsed data
      displayResults(emailContainer, contentAnalysisData, parsedUrlAnalysis);
    })
    .catch(error => {
      console.error('Error:', error);
      const resultDiv = document.createElement('div');
      resultDiv.className = 'phishing-result high';
      resultDiv.textContent = 'Error analyzing email: ' + error.message;
      emailContainer.parentNode.insertBefore(resultDiv, emailContainer.nextSibling);
    })
    .finally(() => {
      // Reset button
      scanButton.textContent = originalText;
      scanButton.disabled = false;
    });
  }
  
  function getEmailContent(emailContainer) {
    // Gmail's email content is usually in a div with role="presentation"
    const contentElements = emailContainer.querySelectorAll('div[role="presentation"]');
    let emailContent = '';
    
    contentElements.forEach(element => {
      emailContent += element.innerText + '\n';
    });
    
    return emailContent;
  }
  
  function displayResults(emailContainer, contentAnalysis, urlAnalysis) {
    const resultDiv = document.createElement('div');
    resultDiv.className = `phishing-result ${(contentAnalysis.phishing_likelihood || '').toLowerCase() || 'medium'}`;
    
    // Add debug information
    console.log('Content Analysis:', contentAnalysis);
    console.log('URL Analysis:', urlAnalysis);

    // Main analysis
    let analysisHtml = `
        <strong>Phishing Likelihood: ${contentAnalysis.phishing_likelihood || 'Unknown'}</strong>
        <p>${contentAnalysis.explanation || 'No explanation provided'}</p>
    `;

    // Add suspicious elements if any
    if (contentAnalysis.suspicious_elements && contentAnalysis.suspicious_elements.length > 0) {
      analysisHtml += '<p><strong>Suspicious Elements:</strong></p><ul>';
      contentAnalysis.suspicious_elements.forEach(element => {
        analysisHtml += `<li>${element}</li>`;
      });
      analysisHtml += '</ul>';
    }
    
    // Add URL analysis if any
    if (Object.keys(urlAnalysis).length > 0) {
      analysisHtml += '<div class="phishing-urls"><strong>URL Analysis:</strong>';
      
      Object.keys(urlAnalysis).forEach(url => {
        // Parse URL analysis data
        let urlData;
        try {
          urlData = typeof urlAnalysis[url] === 'string' 
            ? JSON.parse(urlAnalysis[url]) 
            : urlAnalysis[url];
        } catch (e) {
          urlData = {
            suspicious_likelihood: "Unknown",
            explanation: "Could not parse analysis",
            suspicious_elements: []
          };
        }
        
        const likelihood = urlData.suspicious_likelihood?.toLowerCase() || 'medium';
        
        analysisHtml += `
          <div class="phishing-url-item ${likelihood}">
            <strong>URL:</strong> ${url}<br>
            <strong>Suspicious Likelihood:</strong> ${urlData.suspicious_likelihood || 'Unknown'}<br>
            <p>${urlData.explanation || 'No explanation provided'}</p>
          </div>
        `;
      });
      
      analysisHtml += '</div>';
    }
    
    resultDiv.innerHTML = analysisHtml;
    
    // Add to page
    emailContainer.parentNode.insertBefore(resultDiv, emailContainer.nextSibling);
  }