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

## GET /api/guest-credit
- Description: Returns the current number of credits for the guest (peek, does NOT decrement).
- Request: guest_id via cookie or query parameter (?guest_id=...)
- Response: { "credits": number }
- Errors: { "error": string }
- Usage: Use to check remaining credits without decrementing.
- **Persistence:** Guest credits are now stored in a persistent SQLite database keyed by guest_id and date.

## POST /api/guest-credit
- Description: Decrements the guest's credits by 1 (if available) and returns the new value.
- Request Body: { "guest_id": string } (or via cookie)
- Response: { "allowed": boolean, "credits": number }
- Errors: { "error": string }
- Usage: Use when a credit is actually being spent (e.g., on submission).
- **Persistence:** Guest credits are now stored in a persistent SQLite database keyed by guest_id and date.

## GET /api/guest-id
- Description: Issues or returns a guest_id (UUID) for the current session. Sets a cookie if not present.
- Response: { "guest_id": string }
- Usage: Call on first visit or when guest_id is missing from localStorage/cookie. 