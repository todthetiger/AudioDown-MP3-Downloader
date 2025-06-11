/**
 * This background script (service worker) handles tasks that need to persist,
 * like listening for download requests.
 */

// Listen for messages from other parts of the extension (e.g., the popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Check if the message is a request to download an MP3
    if (request.action === 'downloadMp3') {
        if (request.url) {
            console.log(`Background: Received download request for ${request.url}`);
            
            // Use the chrome.downloads API to download the file
            chrome.downloads.download({
                url: request.url,
                // Suggest a filename. The browser may still prompt the user.
                filename: request.filename || 'download.mp3' 
            }, (downloadId) => {
                if (chrome.runtime.lastError) {
                    console.error(`Download failed: ${chrome.runtime.lastError.message}`);
                } else {
                    console.log(`Download started with ID: ${downloadId}`);
                }
            });
        }
        // It's good practice to send a response, even if it's just to acknowledge.
        sendResponse({ status: 'Download initiated' }); 
    }
     // Return true to indicate you wish to send a response asynchronously
    return true;
});

// This function creates placeholder icons when the extension is installed.
// This is so you don't have to create image files manually.
function createInitialIcons() {
  const icons = [
    { size: 16, path: 'images/icon16.png' },
    { size: 48, path: 'images/icon48.png' },
    { size: 128, path: 'images/icon128.png' }
  ];

  icons.forEach(iconInfo => {
    const canvas = new OffscreenCanvas(iconInfo.size, iconInfo.size);
    const context = canvas.getContext('2d');
    
    // Background
    context.fillStyle = '#4f46e5'; // Indigo color
    context.fillRect(0, 0, iconInfo.size, iconInfo.size);
    
    // Simple "MP3" text
    context.fillStyle = 'white';
    context.font = `${iconInfo.size * 0.5}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('MP3', iconInfo.size / 2, iconInfo.size / 2);

    canvas.convertToBlob().then(blob => {
       // Note: In a real extension, you would package these files.
       // For testing, this demonstrates how they could be generated.
       // We can't write files, so this is illustrative. You'll need to create these files.
       console.log(`Generated icon data for ${iconInfo.path}`);
    });
  });
}

// Run this when the extension is first installed.
chrome.runtime.onInstalled.addListener(() => {
    console.log('MP3 Downloader extension installed.');
    // createInitialIcons(); // You'd call this, but for now, you must create the files.
});
background.js
