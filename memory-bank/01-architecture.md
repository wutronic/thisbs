# Architecture Documentation

## System Architecture
- The system consists of a Next.js frontend and a Node.js/Express backend.
- The frontend provides a landing page for video link submission and displays the transcript result.
- The backend handles video download (yt-dlp), audio conversion (ffmpeg), and transcription (OpenAI Whisper API).
- Temporary files are stored locally and cleaned up after processing.

## Design Patterns
- RESTful API between frontend and backend.
- Separation of concerns: UI, processing, and external API interaction are modularized.

## Data Flow
1. User submits video link via frontend.
2. Frontend sends link to backend API.
3. Backend downloads video, converts to WAV, sends to Whisper API.
4. Backend returns transcript to frontend.
5. Frontend displays transcript on a new page.

## Security Considerations
- Input validation for video links.
- Limit file sizes and processing time.
- Secure API keys for Whisper.
- Temporary file cleanup.

## Database Schema
- None for MVP; all processing is stateless and ephemeral.

## Technical Decisions
- Chose Next.js and Tailwind for rapid, beautiful UI.
- Node.js/Express for backend due to ecosystem and ease of integrating yt-dlp/ffmpeg.
- OpenAI Whisper API for reliable transcription.