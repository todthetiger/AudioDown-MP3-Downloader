// Get references to all the HTML elements we'll need to interact with
const scanPageBtn = document.getElementById('scanPageBtn');
const resultsContainer = document.getElementById('resultsContainer');
const loaderElement = document.getElementById('loader');
const noResultsElement = document.getElementById('noResults');

// NEW: References for bulk download elements
const resultsHeader = document.getElementById('resultsHeader');
const audioListElement = document.getElementById('audioList');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');


/**
 * Injects the content script into the current tab to find audio files.
 */
function findAudioFilesInCurrentTab() {
    // Show the results section and the loader spinner
    resultsContainer.classList.remove('hidden');
    loaderElement.classList.remove('hidden');
    audioListElement.innerHTML = ''; // Clear previous results
    noResultsElement.classList.add('hidden'); // Hide no-results message
    resultsHeader.classList.add('hidden'); // NEW: Hide bulk controls

    // Find the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        
        if (!currentTab || !currentTab.id || !currentTab.url?.startsWith('http')) {
            loaderElement.classList.add('hidden');
            noResultsElement.textContent = 'Cannot scan this page. Please navigate to a valid webpage.';
            noResultsElement.classList.remove('hidden');
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                loaderElement.classList.add('hidden');
                noResultsElement.textContent = 'Error: Cannot access this page. Some pages are protected.';
                noResultsElement.classList.remove('hidden');
                return;
            }

            chrome.tabs.sendMessage(currentTab.id, { action: 'findMp3s' }, (response) => {
                loaderElement.classList.add('hidden');

                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    noResultsElement.textContent = 'Could not communicate with the page. Try reloading it.';
                    noResultsElement.classList.remove('hidden');
                    return;
                }
                
                if (response && response.mp3s && response.mp3s.length > 0) {
                    resultsHeader.classList.remove('hidden'); // NEW: Show bulk controls
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
    selectAllCheckbox.checked = false; // Reset checkbox

    audioUrls.forEach((audioUrl, index) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-slate-200';

        const fileName = decodeURIComponent(audioUrl.split('/').pop().split('?')[0]);
        const displayName = fileName || `Track ${index + 1}`;

        // Container for checkbox and text
        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex items-center flex-grow min-w-0'; // Allow container to shrink

        // NEW: Checkbox for selecting the file
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-checkbox mr-3 flex-shrink-0';
        // Store URL and filename in the checkbox's dataset for easy access
        checkbox.dataset.url = audioUrl;
        checkbox.dataset.filename = fileName;

        const textElement = document.createElement('span');
        textElement.textContent = displayName;
        textElement.className = 'text-base truncate';
        textElement.title = decodeURIComponent(audioUrl);
        
        infoContainer.appendChild(checkbox);
        infoContainer.appendChild(textElement);

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

        item.appendChild(infoContainer);
        item.appendChild(downloadBtn);
        audioListElement.appendChild(item);
    });
}

/**
 * NEW: Handles the "Select All" checkbox functionality.
 */
function handleSelectAll() {
    const allCheckboxes = audioListElement.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

/**
 * NEW: Handles downloading all selected files.
 */
function handleDownloadSelected() {
    const selectedCheckboxes = audioListElement.querySelectorAll('input[type="checkbox"]:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one file to download.');
        return;
    }

    selectedCheckboxes.forEach(checkbox => {
        chrome.runtime.sendMessage({
            action: 'downloadMp3',
            url: checkbox.dataset.url,
            filename: checkbox.dataset.filename
        });
    });

    // Provide user feedback
    downloadSelectedBtn.textContent = `Sent ${selectedCheckboxes.length}!`;
    downloadSelectedBtn.disabled = true;
    setTimeout(() => {
        downloadSelectedBtn.textContent = 'Download Selected';
        downloadSelectedBtn.disabled = false;
        selectAllCheckbox.checked = false; // Uncheck all after download
        handleSelectAll();
    }, 2500);
}


// --- Event Listeners ---

scanPageBtn.addEventListener('click', findAudioFilesInCurrentTab);
selectAllCheckbox.addEventListener('click', handleSelectAll);
downloadSelectedBtn.addEventListener('click', handleDownloadSelected);
