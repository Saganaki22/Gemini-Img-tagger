# 🏷️ Image Tagger Pro

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=flat-square&logo=vercel)](https://drbaph.is-a.dev/Gemini-Img-tagger)
[![Gemini API](https://img.shields.io/badge/Gemini-API-blue?style=flat-square&logo=google)](https://aistudio.google.com/app/api-keys)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

![Open Graph Image](https://drbaph.is-a.dev/Gemini-Img-tagger/opengraph.jpg)

An intuitive, plug-and-play solution for batch tagging large image datasets using Google's Gemini AI models. Process hundreds of images with intelligent, context-aware descriptions optimized for machine learning training and visual indexing.

## ✨ Features

- **🚀 Batch Processing** - Process multiple images simultaneously with configurable batch sizes
- **🤖 Gemini 3.5 Flash & Pro Support** - Choose between speed (Flash) or advanced reasoning (Pro)
- **🖼️ Visual Gallery** - Browse and manage your images with an intuitive card-based interface
- **🎯 Smart Selection** - Ctrl/Cmd+Click to select specific images for targeted processing
- **📝 Rich Text Editor** - Built-in modal editor for refining AI-generated descriptions
- **📦 ZIP Export** - Export images with their corresponding .txt files in one click
- **💾 Auto-Save** - API key and system instructions are securely stored locally
- **🔒 Secure Storage** - API keys are encrypted using XOR encryption before local storage
- **📊 Progress Tracking** - Real-time progress bar and console logging
- **🎨 Modern UI** - Beautiful dark-themed interface with smooth animations
- **📱 Responsive Design** - Works seamlessly on desktop and tablet devices

## 🎯 Perfect For

- **Dataset Preparation** - Generate training captions for Stable Diffusion, LoRA, etc.
- **Visual Search Indexing** - Create searchable metadata for image collections
- **Content Management** - Automatically tag and describe photo libraries
- **Research Projects** - Batch analyze visual data for academic or commercial use

## 🚀 Quick Start

### Live Demo
Try it now without installation: **[https://drbaph.is-a.dev/Gemini-Img-tagger](https://drbaph.is-a.dev/Gemini-Img-tagger)**

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Gemini API Key** - [Get yours free from Google AI Studio](https://aistudio.google.com/app/api-keys)

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Saganaki22/Gemini-Img-tagger.git
   cd Gemini-Img-tagger/app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

5. **Add your API key**
   - Click "Get API Key →" or visit [Google AI Studio](https://aistudio.google.com/app/api-keys)
   - Generate a new API key
   - Paste it into the API Key field in the app

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` folder, ready for deployment.

## 📖 How to Use

1. **Configure Settings**
   - Choose your preferred Gemini model (Flash for speed, Pro for quality)
   - Adjust system instructions (click the maximize button for full editor)
   - Set your custom prompt prefix

2. **Upload Images**
   - Drag and drop or click to browse
   - Supports JPG, PNG, WebP, and ZIP files

3. **Process**
   - Click "Start Batch" to process all images
   - Or Ctrl/Cmd+Click to select specific images, then "Start Selected"

4. **Review & Edit**
   - Click any image to view and edit the generated text
   - Use arrow keys to navigate between images in the modal

5. **Export**
   - Click "Export ZIP" to download images with their .txt files
   - Or "Export Selected (X)" to export only chosen images

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite
- **API**: Google Gemini API
- **Storage**: LocalStorage with encryption

## 🔐 Security & Privacy

- Your API key is **encrypted** before being stored locally
- All image processing happens client-side via API calls
- No images or data are uploaded to any server
- Your data stays on your machine

## 📝 System Instructions Template

The app comes with a comprehensive default system prompt for high-quality image descriptions:

- **Primary Subject**: Detailed focus on main subjects, actions, and textures
- **Spatial Context**: Environment, background, and object relationships
- **Technical Qualities**: Medium, lighting, color palette, camera attributes

Click the maximize button (⛶) next to "System Instructions" to view and customize the full prompt.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 🙏 Acknowledgments

- Built with [Google Gemini API](https://ai.google.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for the AI/ML community**

[Live Demo](https://drbaph.is-a.dev/Gemini-Img-tagger) • [Report Bug](https://github.com/Saganaki22/Gemini-Img-tagger/issues) • [Request Feature](https://github.com/Saganaki22/Gemini-Img-tagger/issues)
