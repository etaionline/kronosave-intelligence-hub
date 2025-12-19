// Content script for KronoSave Intelligence Capture Extension
let isCapturing = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'capturePage') {
    captureCurrentPage()
      .then(data => {
        chrome.runtime.sendMessage({
          action: 'capturePage',
          data: data
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError);
            showNotification('Error: ' + chrome.runtime.lastError.message, 'error');
          } else if (response && response.error) {
            showNotification('Capture failed: ' + response.error, 'error');
          } else {
            showNotification('Content captured! AI agents are processing...', 'success');
          }
        });
      })
      .catch(error => {
        console.error('Capture error:', error);
        showNotification('Capture failed: ' + error.message, 'error');
      });
  }
});

async function captureCurrentPage() {
  if (isCapturing) {
    throw new Error('Capture already in progress');
  }
  
  isCapturing = true;
  
  try {
    // Capture page metadata
    const url = window.location.href;
    const title = document.title;
    
    // Extract main content
    const content = extractMainContent();
    
    // Capture images
    const images = captureImages();
    
    // Capture metadata
    const metadata = extractMetadata();
    
    // Capture selected text if any
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';
    
    const capturedData = {
      url,
      title,
      content: content,
      images,
      metadata: {
        ...metadata,
        selectedText,
        wordCount: content.split(/\s+/).length,
        timestamp: new Date().toISOString()
      }
    };
    
    return capturedData;
  } finally {
    isCapturing = false;
  }
}

function extractMainContent() {
  // Remove scripts, styles, and navigation
  const clone = document.body.cloneNode(true);
  
  // Remove unwanted elements
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer', 
    '.advertisement', '.ad', '.sidebar', '.menu',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]'
  ];
  
  unwantedSelectors.forEach(selector => {
    const elements = clone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });
  
  // Get main content
  let mainContent = '';
  
  // Try to find main content areas
  const contentSelectors = [
    'main', '[role="main"]', '.main-content', 
    '.content', '#content', '.post', '.article'
  ];
  
  for (const selector of contentSelectors) {
    const element = clone.querySelector(selector);
    if (element && element.textContent.trim().length > 100) {
      mainContent = element.textContent.trim();
      break;
    }
  }
  
  // Fallback to body content
  if (!mainContent) {
    mainContent = clone.textContent.trim();
  }
  
  // Clean up content
  mainContent = mainContent
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .substring(0, 10000); // Limit to 10k characters
  
  return mainContent;
}

function captureImages() {
  const images = [];
  const imageElements = document.querySelectorAll('img');
  
  imageElements.forEach((img, index) => {
    if (img.src && !img.src.startsWith('data:') && index < 10) { // Limit to 10 images
      images.push({
        src: img.src,
        alt: img.alt || '',
        title: img.title || '',
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      });
    }
  });
  
  return images;
}

function extractMetadata() {
  const metadata = {};
  
  // Meta tags
  const metaTags = document.querySelectorAll('meta');
  metaTags.forEach(tag => {
    const name = tag.getAttribute('name') || tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (name && content) {
      metadata[name] = content;
    }
  });
  
  // Open Graph data
  const ogTags = document.querySelectorAll('meta[property^="og:"]');
  ogTags.forEach(tag => {
    const property = tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (property && content) {
      metadata[property] = content;
    }
  });
  
  // Structured data
  const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
  structuredData.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      metadata.structuredData = data;
    } catch (e) {
      // Ignore invalid JSON
    }
  });
  
  return metadata;
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `kronosave-notification kronosave-notification-${type}`;
  notification.innerHTML = `
    <div class="kronosave-notification-content">
      <span>${message}</span>
      <button class="kronosave-notification-close">&times;</button>
    </div>
  `;
  
  // Add styles
  if (!document.querySelector('#kronosave-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'kronosave-notification-styles';
    style.textContent = `
      .kronosave-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid #007acc;
        max-width: 400px;
        animation: kronosave-slide-in 0.3s ease-out;
      }
      
      .kronosave-notification-success { border-left-color: #28a745; }
      .kronosave-notification-error { border-left-color: #dc3545; }
      .kronosave-notification-info { border-left-color: #007acc; }
      
      .kronosave-notification-content {
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .kronosave-notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 0;
        margin-left: 12px;
      }
      
      .kronosave-notification-close:hover {
        color: #333;
      }
      
      @keyframes kronosave-slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
  
  // Close button
  notification.querySelector('.kronosave-notification-close').addEventListener('click', () => {
    notification.remove();
  });
}

// Keyboard shortcut handler
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    captureCurrentPage().catch(error => {
      showNotification('Capture failed: ' + error.message, 'error');
    });
  }
});