# API Documentation

## POST /api/transcribe
- Description: Accepts a video link, downloads the video, converts to WAV, sends to Whisper, and returns the transcript.
- Request Body: { "videoUrl": string }
- Response: { "transcript": string }
- Errors: { "error": string }

## (Internal) VideoDownloader
- Handles video download from provided link using yt-dlp.

## (Internal) AudioConverter
- Converts downloaded video to WAV using ffmpeg.

## (Internal) WhisperClient
- Sends WAV file to OpenAI Whisper API and retrieves transcript. 