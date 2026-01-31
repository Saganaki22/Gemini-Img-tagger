# 🏷️ Gemini IMG Tagger

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=flat-square&logo=vercel)](https://drbaph.is-a.dev/Gemini-Img-tagger)
[![Gemini API](https://img.shields.io/badge/Gemini-API-blue?style=flat-square&logo=google)](https://aistudio.google.com/app/api-keys)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

![Open Graph Image](https://drbaph.is-a.dev/Gemini-Img-tagger/opengraph.jpg)

An intuitive, plug-and-play solution for batch tagging large image datasets using Google's Gemini AI models. Process hundreds of images with intelligent, context-aware descriptions optimized for machine learning training and visual indexing.

## ✨ Features

### 🚀 Core Processing
- **Batch Processing** - Process multiple images simultaneously with configurable batch sizes (1-100 per request)
- **Multiple Gemini Models** - Choose between Gemini 3 Flash (fast) and Pro (advanced reasoning)
- **Pause & Resume** - Stop batch processing anytime without losing progress
- **Individual Retry** - Click the refresh button on any image to reprocess just that one

### 🖼️ Image Management
- **Visual Gallery** - Browse and manage images with an intuitive card-based interface
- **Multiple View Modes** - Grid (3/6 columns) and List view with sorting options (A-Z / Z-A)
- **Smart Selection** - 
  - **Click** to select/deselect an image
  - **Ctrl/Cmd + Click** to add/remove individual images from selection
  - **Ctrl/Cmd + Drag** to select multiple images at once
  - **Select All / Clear** buttons for quick bulk selection
- **Image Search** - Find images quickly by typing their filename (auto-navigates to correct page)

### 📝 Text Generation & Editing
- **Rich Text Editor** - Built-in modal editor for refining AI-generated descriptions
- **System Instructions** - Customize AI behavior with high-level guidelines (click ⛶ to expand full editor)
- **Custom Prompt** - Add trigger words or prefixes to all generated text
- **Real-time Editing** - Click on any image's text to view and edit instantly

### 📦 Import & Export
- **Multiple Upload Methods** - Drag & drop, click to browse, or paste images
- **ZIP Support** - Upload ZIP archives containing images
- **Auto-Caption Loading** - When uploading a ZIP with .txt files matching image names, captions are auto-loaded
- **Export ZIP** - Download all images with their .txt caption files
- **Export Selected** - Export only the images you've selected
- **Individual Downloads** - Download single image caption files

### 🔊 Notifications & Feedback
- **Sound Notifications** - Pleasant chime (C major chord arpeggio) plays when batch completes
- **Visual Feedback** - Title scrolls "Batch Finished Successfully" for 10 seconds on completion
- **Mute Toggle** - Use the speaker icon in the header to mute/unmute notification sounds
- **Progress Tracking** - Real-time progress bar showing completed/total count
- **Time Estimates** - Live timer showing elapsed time and estimated remaining time
- **Console Log** - Detailed processing log with timestamps and status messages

### 🎨 User Interface
- **Modern Dark Theme** - Beautiful dark interface with gold/yellow accents and smooth animations
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Pagination** - Grid views show configurable items per page (30, 60, 100, 200, 500, or All)
- **Help Modal** - Click the ? button for detailed usage instructions
- **Customizable Font Size** - Adjustable font size in System Instructions modal (10-20px)

### 🔐 Security & Privacy
- **Encrypted Storage** - API keys are encrypted using XOR encryption before local storage
- **Local Processing** - All image processing happens client-side via API calls
- **No Data Uploads** - No images or data are uploaded to any server
- **Auto-Save** - System instructions, settings, and font size preferences are securely stored locally

## 🎯 Perfect For

- **Dataset Preparation** - Generate training captions for Stable Diffusion, LoRA, Flux, etc.
- **Visual Search Indexing** - Create searchable metadata for image collections
- **Content Management** - Automatically tag and describe photo libraries
- **Research Projects** - Batch analyze visual data for academic or commercial use
- **E-commerce** - Generate product descriptions for large catalogs

---

## 🚀 Quick Start

### Live Demo
Try it now without installation: **[https://drbaph.is-a.dev/Gemini-Img-tagger](https://drbaph.is-a.dev/Gemini-Img-tagger)**

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Gemini API Key** - [Get yours free from Google AI Studio](https://aistudio.google.com/app/api-keys)

### Local Installation

```bash
git clone https://github.com/Saganaki22/Gemini-Img-tagger.git
cd Gemini-Img-tagger/app
npm install
npm run dev
```

Open your browser to `http://localhost:5173` and add your API key.

---

## 📖 Usage Guide

<details>
<summary><strong>🔑 Setting Up API Key</strong></summary>

1. Visit [Google AI Studio](https://aistudio.google.com/app/api-keys)
2. Generate a new API key
3. Paste it into the API Key field in the app
4. Your key is encrypted and stored locally

</details>

<details>
<summary><strong>📤 Uploading Images</strong></summary>

- **Drag & Drop**: Drop images or ZIP files onto the upload area
- **Click to Browse**: Select files from your computer
- **Supported Formats**: JPG, PNG, WebP, TXT, ZIP
- **ZIP with Captions**: If your ZIP includes .txt files with matching names, they'll auto-load as pre-existing captions

</details>

<details>
<summary><strong>🖱️ Selecting Images</strong></summary>

| Action | Description |
|--------|-------------|
| **Click** | Select one image (deselects others) |
| **Ctrl + Click** | Add/remove from selection |
| **Ctrl + Drag** | Select multiple at once |
| **Select All** | Select every image |
| **Clear** | Deselect all |

</details>

<details>
<summary><strong>⚡ Processing Images</strong></summary>

- **Start Batch** - Process all pending images (green button)
- **Start Selected** - Process only selected images
- **Pause** - Temporarily stop (finishes current batch first)
- **Stop** - Abort immediately
- **↻ Retry** - Click the refresh icon on any image to retry just that one
- **Batch Size** - Adjust how many images per API request (default: 5)

</details>

<details>
<summary><strong>📝 Customizing Prompts</strong></summary>

1. Click the **⛶** button next to "System Instructions"
2. Edit **System Instructions** (70% of modal) - Guides AI behavior
3. Edit **Prompt** (30% of modal) - Add trigger words
4. Use the **A-A slider** to adjust font size (10-20px)
5. Changes auto-save when you close the modal

**Example Trigger Words:**
```
Include this at the beginning of the description: example_trigger_word,
```

</details>

<details>
<summary><strong>🔍 Searching Images</strong></summary>

1. Click the **search icon** in the header
2. Type part of an image filename
3. Press **Enter** or click **Find**
4. The app will:
   - Navigate to the correct page automatically
   - Select and scroll to the found image
   - Highlight it briefly

</details>

<details>
<summary><strong>💾 Exporting Results</strong></summary>

- **Export ZIP** - Download all completed images with .txt files
- **Export Selected (X)** - Export only selected images
- **Individual Download** - Click download icon on any image

</details>

---

## 🎨 Interface Features

### View Modes
- **Grid 3** - 3 columns, larger images
- **Grid 6** - 6 columns, smaller images  
- **List** - Compact list view with thumbnails

### Pagination
- Configure items per page: **30, 60, 100, 200, 500, or All**
- List view always shows all images (pagination disabled)
- Grid views paginate based on your selection

### Items Per Page Behavior
- **Grid Views**: Remembers your last selection
- **List View**: Automatically switches to "All" and disables dropdown
- When switching back to grid: Restores your previous grid setting

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite 7
- **API**: Google Gemini API
- **Storage**: LocalStorage with XOR encryption
- **Icons**: Lucide React
- **ZIP Handling**: JSZip

---

## 🔐 Security & Privacy

- Your API key is **encrypted** before being stored locally
- All image processing happens client-side via API calls
- No images or data are uploaded to any server
- Your data stays on your machine

---

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

---

## 🙏 Acknowledgments

- Built with [Google Gemini API](https://ai.google.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for the AI/ML community**

[Live Demo](https://drbaph.is-a.dev/Gemini-Img-tagger) • [Report Bug](https://github.com/Saganaki22/Gemini-Img-tagger/issues) • [Request Feature](https://github.com/Saganaki22/Gemini-Img-tagger/issues)
