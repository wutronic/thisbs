# Components

## Frontend
- LandingPage: Input field and submit button for video link (dark, Dribbble-inspired UI)
- TranscriptPage: Displays the transcribed text result
- Loading/ProgressIndicator: Shows status during processing
- ErrorDisplay: User-friendly error messages

## Backend
- /api/transcribe endpoint: Receives video link, orchestrates download, conversion, and transcription
- VideoDownloader: Handles yt-dlp integration
- AudioConverter: Handles ffmpeg conversion
- WhisperClient: Handles OpenAI Whisper API requests
- TempFileManager: Manages temporary file storage and cleanup

# Instagram Media Download Flow (2024-06-13)

## Detection
- `isInstagramUrl(url)` utility detects if a URL is from Instagram (regex match for `instagram.com/`).
- Used in `/api/transcribe` to branch logic for Instagram downloads.
- After calling `metadownloader`, the new `downloadInstagramMedia` utility inspects the returned metadata and/or file extension to determine if the media is a video or image.
- The `file-type` library (v17+) is used for file type validation after download. For CommonJS, use: `const { fromFile } = require('file-type');` and call `await fromFile(outputPath)`.
- If detection fails, the backend logs the full metadownloader result, direct URL, file path, file size, and any errors for debugging.
- If the media type is still unknown, a user-friendly error is returned and all relevant info is logged.

## Download
- `downloadInstagramMedia(url, outputDir)` uses the `metadownloader` NPM package to fetch the direct media URL from Instagram.
- Downloads the media file using `axios` and saves it to the output directory with the correct extension.
- Returns both the file path and detected media type (`video` or `image`).
- Debug logs are added for each step (start, direct URL, download complete, type detection).

## Integration
- In `/api/transcribe`, if `isInstagramUrl(videoUrl)` is true, uses `downloadInstagramMedia` instead of yt-dlp.
- If the media type is `video`, audio is extracted and transcribed as usual.
- If the media type is `image`, OCR is run and the extracted text is analyzed.
- If the media type is unknown or unsupported, a user-friendly error is returned.
- All error handling and cleanup is consistent with other flows.

## Error Handling
- If `metadownloader` fails to fetch or download, a user-friendly error is returned.
- If the media type is unsupported, a user-friendly error is returned.
- All steps are logged for debugging.
- ffmpeg errors during audio conversion are now logged with full stderr output for easier diagnosis.

## Debugging
- Check backend logs for `[InstagramDL]` messages to trace Instagram download steps and media type detection.
- If download or conversion fails, check for changes in Instagram's public media URL structure, metadownloader updates, or ffmpeg stderr output.

# Image-to-Text (OCR) Flow (2024-06-13)

## Detection
- `isImageUrl(url)` utility detects if a URL is an image (by extension).
- Used in `/api/transcribe` to branch logic for image-to-text.

## Preprocessing
- Before OCR, images are preprocessed using `sharp`:
  - Converted to grayscale
  - Contrast increased
  - Binarized (thresholded to black and white)
  - Alpha channel removed if present
  - Upscaled to at least 600px width if smaller

## OCR
- `extractTextFromImage(imagePath)` runs Tesseract.js OCR on the preprocessed image.
- Cycles through multiple Page Segmentation Modes (PSM): 6 (single block), 7 (single line), 11 (sparse text).
- For each PSM, logs the output and checks quality (length, alphanumeric ratio).
- Returns the best output or throws an error if no meaningful text is found.

## Integration
- In `/api/transcribe`, if `isImageUrl(videoUrl)` is true, downloads and preprocesses the image, runs OCR, and treats the extracted text as the transcript.
- The transcript is then analyzed and claim-checked as with videos.
- All error handling and cleanup is consistent with other flows.

## Error Handling
- If image download, preprocessing, or OCR fails, a user-friendly error is returned.
- All steps are logged for debugging.

## Debugging
- Check backend logs for `[ImageDL]`, `[OCR]`, and preprocessing messages to trace image download, preprocessing, and OCR steps.
- If OCR fails, check for image format issues, preprocessing effectiveness, or try additional PSMs.

# Planned Features & Code Snippets

## Frontend

### 1. Landing Page (Video Link Submission)
```tsx
// src/app/page.tsx
export default function LandingPage() {
  // ...existing code...
  // On submit, POST to /api/transcribe and route to TranscriptPage
}
```

### 2. Transcript Page (Display Result)
```tsx
// src/app/transcript/page.tsx
export default function TranscriptPage({ transcript }) {
  return (
    <div className="prose dark:prose-invert mx-auto p-8">
      <h2>Transcript</h2>
      <pre>{transcript}</pre>
    </div>
  );
}
```

### 3. Loading/Progress Indicator
```tsx
// src/components/LoadingSpinner.tsx
export default function LoadingSpinner() {
  return <div className="animate-spin h-8 w-8 border-4 border-accent rounded-full" />;
}
```

### 4. Error Display
```tsx
// src/components/ErrorDisplay.tsx
export default function ErrorDisplay({ message }) {
  return <div className="text-red-500 bg-surface p-4 rounded-xl">{message}</div>;
}
```

### 5. Route to Transcript Page After Submission
```tsx
// On successful POST, route to /transcript and display transcript result.
import { useRouter } from "next/navigation";
// ...
const router = useRouter();
// ...
router.push(`/transcript?text=${encodeURIComponent(data.transcript)}`);
```

## Backend (Enhancements)

### 1. Add Logging for Debugging
```js
// Example: backend/routes/transcribe.js
console.log('Starting transcription for:', videoUrl);
```

### 2. Support for More Video Sources
```js
// Extend videoDownloader.js to handle non-YouTube URLs
```

### 3. Rate Limiting & API Key Usage
```js
// Use express-rate-limit middleware in app.js
``` 