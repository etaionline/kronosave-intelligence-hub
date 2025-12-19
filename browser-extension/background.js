// Background script for KronoSave Intelligence Capture Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('KronoSave Intelligence Capture Extension installed');
  
  // Initialize storage
  chrome.storage.sync.get(['kronosaveApiKey', 'capturedCount'], (result) => {
    if (!result.kronosaveApiKey) {
      chrome.storage.sync.set({
        kronosaveApiKey: '',
        capturedCount: 0
      });
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'capturePage') {
    handlePageCapture(request.data, sender.tab.id)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'getApiKey') {
    chrome.storage.sync.get(['kronosaveApiKey'], (result) => {
      sendResponse({ apiKey: result.kronosaveApiKey || '' });
    });
    return true;
  }
  
  if (request.action === 'setApiKey') {
    chrome.storage.sync.set({ kronosaveApiKey: request.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

async function handlePageCapture(data, tabId) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('KronoSave API key not configured. Please set it in the extension popup.');
  }

  // Send captured data to KronoSave Intelligence Hub
  const response = await fetch('https://payrw82xokmt.space.minimax.io/api/capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      url: data.url,
      title: data.title,
      content: data.content,
      images: data.images,
      metadata: data.metadata,
      timestamp: Date.now()
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to capture: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Update captured count
  chrome.storage.sync.get(['capturedCount'], (result) => {
    const count = (result.capturedCount || 0) + 1;
    chrome.storage.sync.set({ capturedCount: count });
  });

  return {
    success: true,
    data: result,
    message: 'Content captured and processed by AI agents'
  };
}

function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['kronosaveApiKey'], (result) => {
      resolve(result.kronosaveApiKey || '');
    });
  });
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'capture') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'capturePage' });
      }
    });
  }
});