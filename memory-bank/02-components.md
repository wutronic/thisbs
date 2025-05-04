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