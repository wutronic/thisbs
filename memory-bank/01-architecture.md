# Architecture Documentation

## System Architecture
- The system consists of a Next.js frontend (deprecated for MVP) and a Node.js/Express backend.
- The backend serves a static HTML/CSS/JS landing page for video link submission and displays the transcript result.
- The backend handles video download (yt-dlp), audio conversion (ffmpeg), and transcription (OpenAI Whisper API) via modular utility files.
- Temporary files are stored locally and cleaned up after processing.
- Static assets (HTML, CSS, JS, favicon, images) are served from the `backend/public` directory using Express's static middleware:
  ```js
  app.use(express.static(path.join(__dirname, 'public')));
  ```

## Modular Utility Files
- **videoDownloader.js**: Handles video download using ytdlp-nodejs.
  ```js
  const { YtDlp } = require('ytdlp-nodejs');
  async function downloadVideo(videoUrl, outputDir) { /* ... */ }
  module.exports = { downloadVideo };
  ```
- **audioConverter.js**: Converts video files to WAV audio using ffmpeg-static.
  ```js
  const ffmpegPath = require('ffmpeg-static');
  async function convertToWav(inputPath, outputDir) { /* ... */ }
  module.exports = { convertToWav };
  ```
- **whisperClient.js**: Sends WAV audio files to the OpenAI Whisper API and returns the transcript.
  ```js
  const axios = require('axios');
  async function transcribeAudio(wavPath) { /* ... */ }
  module.exports = { transcribeAudio };
  ```

## Backend Routing & API
- **/api/transcribe**: Main POST endpoint for transcription. Receives `{ videoUrl }`, processes the video, and returns `{ transcript }`.
  ```js
  router.post('/', async (req, res) => { /* ... */ });
  ```
- **Static HTML landing page**: Served at `/` via Express static middleware. Handles UI, form submission, and result display with client-side JS.

## Makefile & Server Management
- The backend includes a Makefile for port management and startup:
  ```makefile
  start: check-port services
  	npm install
  	PORT=$(PORT) npm start
  clean:
  	@if lsof -i :$(PORT) > /dev/null; then \
  		PID=$$(lsof -ti :$(PORT)); \
  		kill -9 $$PID; \
  	fi
  ```
- The server is started via `npm start` or `make start`, running `bin/www` which creates and listens with the Express app.

## Data Flow
1. User submits video link via landing page form.
2. Client-side JS sends link to backend `/api/transcribe` as JSON.
3. Backend downloads video, converts to WAV, sends to Whisper API.
4. Backend returns transcript to frontend.
5. Frontend dynamically creates and displays the transcript result.

## UI/UX Flow
- The landing page features:
  - Dark, minimal, modern design (custom CSS).
  - Input field with paste button for clipboard.
  - Submit button.
  - Status row below the form: spinner and cycling status text (50+ nerdy/terminal phrases).
  - Transcript result appears only after a successful response.
  - Full favicon suite for cross-device/browser compatibility.

## Security Considerations
- Input validation for video links.
- Limit file sizes and processing time.
- Secure API keys for Whisper.
- Temporary file cleanup.

## Database Schema
- None for MVP; all processing is stateless and ephemeral.

## Technical Decisions
- Chose static HTML/CSS/JS for MVP UI to simplify deployment and reduce complexity.
- Node.js/Express for backend due to ecosystem and ease of integrating yt-dlp/ffmpeg.
- Modular utility files for maintainability and testability.
- OpenAI Whisper API for reliable transcription.
- Makefile for backend management and port cleanup.