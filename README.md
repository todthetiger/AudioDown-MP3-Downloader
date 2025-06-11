# **AudioDown \- Chrome Extension**

**A simple and effective Chrome extension for finding and downloading audio files from any webpage.**

### **GitHub Description**

Here is a short and sweet description you can use for your GitHub repository's "About" section:

A browser extension that scans webpages to find embedded audio files (MP3, etc.) and allows users to download them with a single click.

## **About The Project**

AudioDown is a lightweight and user-friendly Chrome extension built to solve a common problem: downloading audio from websites that don't offer a direct download link. With a single click, AudioDown scans the active webpage, identifies all embedded audio sources, and presents them in a clean list for you to download.

## **Features**

* **One-Click Scan:** Instantly scan any active webpage for audio files.  
* **Simple UI:** A clean, intuitive interface that requires no configuration.  
* **Direct Downloads:** Download files directly through your browser's download manager.  
* **Intelligent Parsing:** Automatically extracts and decodes filenames for easy identification.

## **How It Works**

The extension is built with three core JavaScript components that work together:

1. **popup.js (The User Interface):** This script manages the extension's popup window—the part you see and interact with. When you click "Scan Current Page," it sends a message to the content.js script to begin its work. It is also responsible for displaying the results it receives back.  
2. **content.js (The Scraper):** This script is the engine of the extension. It gets injected directly into the webpage you're viewing. Its job is to search the page's HTML for \<audio\> and \<source\> tags to find all direct links to audio files (like .mp3 files). Once it compiles a list, it sends the URLs back to the popup.js script.  
3. **background.js (The Downloader):** This script runs in the background. Its primary role is to listen for download requests from the popup. When you click a "Download" button, popup.js sends the audio URL to background.js, which then uses the chrome.downloads API to securely and reliably download the file to your computer.

## **Project Structure**

The extension is organized into the following files:

/audio-downloader-extension  
|  
|-- manifest.json         \# Configures the extension, its permissions, and files  
|-- popup.html            \# The HTML structure for the popup window  
|-- popup.js              \# The JavaScript logic for the popup UI  
|-- content.js            \# The script that finds audio files on the webpage  
|-- background.js         \# The service worker that handles downloads  
|  
|-- /images  
|   |-- icon16.png        \# 16x16 icon for the extension  
|   |-- icon48.png        \# 48x48 icon  
|   |-- icon128.png       \# 128x128 icon

## **How to Install and Test**

Since this extension is not on the Chrome Web Store, you can load it locally using Developer Mode.

1. **Download/Clone the Repository:** Get all the project files onto your local machine.  
2. **Open Chrome Extensions:** Open Google Chrome and navigate to chrome://extensions.  
3. **Enable Developer Mode:** In the top-right corner of the Extensions page, turn on the "Developer mode" toggle.  
4. **Load the Extension:**  
   * Click the "Load unpacked" button that appears.  
   * In the file selection dialog, navigate to and select the root folder of the project (audio-downloader-extension).  
5. **Done\!** The AudioDown extension icon will now appear in your Chrome toolbar. You can pin it for easy access and start testing it on websites with embedded audio.

## **Technologies Used**

* **HTML5**  
* **CSS (Tailwind CSS)**  
* **JavaScript (ES6)**  
* **Chrome Extension APIs (Manifest V3)**
