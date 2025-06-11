/**
 * This content script is injected into the webpage to find MP3 links.
 */

/**
 * Finds all MP3 links on the current page.
 * It looks for <a> tags linking to .mp3 files and <audio> tags with .mp3 sources.
 * @returns {string[]} A list of unique MP3 URLs.
 */
function findAllMp3Links() {
    console.log("MP3 Downloader: Searching for MP3s on the page.");
    const mp3Urls = new Set(); // Use a Set to avoid duplicate URLs

    // 1. Find all <audio> tags and get their src
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        if (audio.src && audio.src.endsWith('.mp3')) {
            // Ensure the URL is absolute
            mp3Urls.add(new URL(audio.src, document.baseURI).href);
        }
        // Also check inside <source> tags within the <audio> element
        const sourceElements = audio.querySelectorAll('source');
        sourceElements.forEach(source => {
            if (source.src && source.src.endsWith('.mp3')) {
                mp3Urls.add(new URL(source.src, document.baseURI).href);
            }
        });
    });

    // 2. Find all <a> (anchor) tags pointing directly to .mp3 files
    const anchorElements = document.querySelectorAll('a');
    anchorElements.forEach(anchor => {
        if (anchor.href && anchor.href.endsWith('.mp3')) {
            mp3Urls.add(new URL(anchor.href, document.baseURI).href);
        }
    });
    
    console.log(`MP3 Downloader: Found ${mp3Urls.size} unique MP3(s).`);
    return Array.from(mp3Urls); // Convert the Set to an array
}

/**
 * Listen for messages from the popup script.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'findMp3s') {
        const mp3s = findAllMp3Links();
        // Send the list of found MP3s back to the popup
        sendResponse({ mp3s: mp3s });
    }
    // Return true to indicate that we will send a response asynchronously
    return true; 
});
