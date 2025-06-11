// Get references to all the HTML elements we'll need to interact with
const scanPageBtn = document.getElementById('scanPageBtn');
const resultsContainer = document.getElementById('resultsContainer');
const audioListElement = document.getElementById('audioList');
const noResultsElement = document.getElementById('noResults');
const loaderElement = document.getElementById('loader');

/**
 * Injects the content script into the current tab to find audio files.
 */
function findAudioFilesInCurrentTab() {
    // Show the results section and the loader spinner
    resultsContainer.classList.remove('hidden');
    loaderElement.classList.remove('hidden');
    audioListElement.innerHTML = ''; // Clear previous results
    noResultsElement.classList.add('hidden'); // Hide no-results message

    // Find the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        
        // Ensure we have a valid tab to scan
        if (!currentTab || !currentTab.id || !currentTab.url?.startsWith('http')) {
            loaderElement.classList.add('hidden');
            noResultsElement.textContent = 'Cannot scan this page. Please navigate to a valid webpage.';
            noResultsElement.classList.remove('hidden');
            return;
        }

        // Execute the content script in the target tab
        chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content.js']
        }, () => {
            // Handle potential errors from script injection
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                loaderElement.classList.add('hidden');
                noResultsElement.textContent = 'Error: Cannot access this page. Some pages are protected.';
                noResultsElement.classList.remove('hidden');
                return;
            }

            // After the script is injected, send a message to it to start scraping
            chrome.tabs.sendMessage(currentTab.id, { action: 'findMp3s' }, (response) => {
                loaderElement.classList.add('hidden'); // Hide loader once we get a response

                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    noResultsElement.textContent = 'Could not communicate with the page. Try reloading it.';
                    noResultsElement.classList.remove('hidden');
                    return;
                }
                
                // Display the results or a "not found" message
                if (response && response.mp3s && response.mp3s.length > 0) {
                    displayFoundAudio(response.mp3s);
                } else {
                    noResultsElement.textContent = 'No audio files found on this page.';
                    noResultsElement.classList.remove('hidden');
                }
            });
        });
    });
}

/**
 * Renders the list of found audio files in the popup.
 * @param {string[]} audioUrls - An array of audio file URLs.
 */
function displayFoundAudio(audioUrls) {
    audioListElement.innerHTML = ''; 
    noResultsElement.classList.add('hidden');

    audioUrls.forEach((audioUrl, index) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-slate-200';

        const fileName = decodeURIComponent(audioUrl.split('/').pop().split('?')[0]);
        const displayName = fileName || `Track ${index + 1}`;

        const textElement = document.createElement('span');
        textElement.textContent = displayName;
        textElement.className = 'text-base truncate';
        textElement.title = decodeURIComponent(audioUrl);

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download';
        downloadBtn.className = 'ml-3 flex-shrink-0 rounded-md bg-green-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-600 transition-all';
        
        downloadBtn.onclick = () => {
            chrome.runtime.sendMessage({
                action: 'downloadMp3',
                url: audioUrl,
                filename: fileName
            });
            downloadBtn.textContent = 'Sent!';
            downloadBtn.disabled = true;
            setTimeout(() => {
                downloadBtn.textContent = 'Download';
                downloadBtn.disabled = false;
            }, 2500); 
        };

        item.appendChild(textElement);
        item.appendChild(downloadBtn);
        audioListElement.appendChild(item);
    });
}

// --- Event Listener ---

// The only action the user can take is clicking the main scan button.
scanPageBtn.addEventListener('click', findAudioFilesInCurrentTab);
