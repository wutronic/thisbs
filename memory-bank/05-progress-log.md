MVP DECISION LOG (2024-06-11):
- Decided on MVP flow: user submits video link, backend downloads and converts to WAV, sends to OpenAI Whisper, returns transcript to frontend for display.
- Chose Next.js (React) + Tailwind CSS for frontend (modern dark UI, rapid dev), Node.js/Express for backend (easy integration with yt-dlp/ffmpeg), OpenAI Whisper API for transcription (reliable, scalable).
- All decisions and architecture documented in Memory Bank for future reference.

DEPENDENCY CHECK LOG (2024-06-11):
- Researched video/audio download and conversion packages for Node.js/Express backend.
- yt-dlp: Considered ytdlp-nodejs (actively maintained, strong TypeScript support, auto-downloads yt-dlp binary, compatible with Node.js 18+ and Express 4).
- ffmpeg-static: Provides static ffmpeg binaries, compatible with Node.js 18+ and Express 4, widely used for media processing.
- multer: Middleware for handling multipart/form-data, compatible with Node.js 18+ and Express 4, actively maintained.
- All selected packages are compatible and widely used together in production Node.js/Express environments.
- Will proceed with: ytdlp-nodejs, ffmpeg-static, multer, axios (for HTTP), and dotenv (for config).

EXPRESS UPGRADE LOG (2024-06-11):
- Upgraded Express from 4.16.1 to 4.21.2 to resolve known vulnerabilities and maintain compatibility with Node.js 18+ and all backend dependencies (ytdlp-nodejs, ffmpeg-static, multer, axios, dotenv).
- Reviewed changelogs for 4.17–4.21: no breaking changes affecting our usage; all changes are backward compatible for our current codebase.
- Confirmed that all middleware and related packages remain compatible with Express 4.21.2.
- All backend dependencies now have no known vulnerabilities as of this upgrade.

BACKEND IMPLEMENTATION LOG (2024-06-11):
- Began backend API implementation for MVP: setting up Express 4.21.2, integrating ytdlp-nodejs, ffmpeg-static, multer, axios, and dotenv.
- Confirmed all dependencies are installed and compatible.
- Next steps: scaffold /api/transcribe endpoint, implement video download, audio conversion, and Whisper API integration.

API ENDPOINT SCAFFOLD LOG (2024-06-11):
- Created backend route /api/transcribe (POST) in routes/transcribe.js and registered it in app.js.
- Endpoint accepts { videoUrl } in the request body and returns 501 Not Implemented for now.
- Ready for integration of video download, audio conversion, and transcription logic.

NEXT IMPLEMENTATION STEP LOG (2024-06-11):
- Preparing to implement core backend logic for /api/transcribe: video download (ytdlp-nodejs), audio conversion (ffmpeg-static), and transcription (OpenAI Whisper API).
- Will modularize logic for maintainability and testability.
- Next: create utility modules and integrate them into the endpoint.

UTILITY MODULE LOG (2024-06-11):
- Created videoDownloader.js utility module for downloading videos using ytdlp-nodejs.
- This module will be used by /api/transcribe to handle video downloads in a modular and testable way.
- Created audioConverter.js utility module for converting video files to WAV audio using ffmpeg-static.
- This module will be used by /api/transcribe to handle audio conversion in a modular and testable way.
- Created whisperClient.js utility module for sending WAV audio files to the OpenAI Whisper API and returning the transcript.
- This module will be used by /api/transcribe to handle transcription in a modular and testable way.

ENDPOINT INTEGRATION LOG (2024-06-11):
- Integrated videoDownloader, audioConverter, and whisperClient modules into /api/transcribe endpoint.
- Endpoint now implements the full flow: downloads video, converts to WAV, transcribes audio, returns transcript, and cleans up temp files.
- Backend MVP flow for video-to-text transcription is now complete and ready for testing.

BACKEND TESTING LOG (2024-06-11):
- Next step: test the /api/transcribe endpoint with real video links to validate the full backend flow (download, convert, transcribe, cleanup).
- Will verify error handling, edge cases, and performance with various video sources.
- Will document any issues, fixes, or improvements needed before frontend integration.

BACKEND ENDPOINT TESTING LOG (2024-06-11):
- Initiating backend endpoint testing using the new 'make clean' and 'make start' workflow to ensure a clean environment.
- Will test /api/transcribe with real video links, verify transcript accuracy, error handling, and resource cleanup.
- Will log any issues, fixes, or improvements discovered during testing.

MAKEFILE CLEAN PROCESS LOG (2024-06-11):
- Added a 'clean' target to the backend Makefile to stop any process using the backend port and clean up before server startup.
- Updated documentation and Memory Bank to instruct maintainers to use 'make clean [PORT=xxxx]' for reliable port management and conflict-free backend startup.
- This process ensures smoother development and onboarding for all contributors.

BUGFIX LOG (2024-06-11):
- Refactored videoDownloader.js to use the correct ytdlp-nodejs API: instantiate YtDlp and use downloadAsync for video download.
- This resolves the 'exec is not a function' error and ensures the backend can download videos as intended.

YT-DLP INSTALL LOG (2024-06-11):
- Installed yt-dlp binary using Homebrew at /opt/homebrew/bin/yt-dlp to resolve 'yt-dlp binary not found' errors from backend.
- This ensures ytdlp-nodejs and the backend can download videos as required for the MVP flow.

YT-DLP PATH CONFIG LOG (2024-06-11):
- Updated videoDownloader.js to explicitly set binaryPath to '/opt/homebrew/bin/yt-dlp' in the YtDlp constructor.
- This ensures the backend reliably finds the yt-dlp binary regardless of environment PATH issues.

BACKEND E2E SUCCESS LOG (2024-06-11):
- Successfully tested /api/transcribe endpoint end-to-end: video download, audio conversion, transcription, and response all work as intended.
- The pipeline is now ready for frontend integration and further feature development.
- Next: Plan frontend features and additional backend enhancements using code snippets for clarity.

FRONTEND LANDING PAGE & CLIENT-SIDE JS LOG (2024-06-12):
- Replaced default Express static page with a custom, dark, minimal landing page (public/index.html) for video link submission.
- Added modern CSS (public/stylesheets/style.css) for a Dribbble-inspired look and feel.
- Implemented client-side JavaScript (public/javascripts/main.js) to handle async form submission, show a loading spinner, and display the transcript or error below the form.
- The frontend now interacts directly with the backend /api/transcribe endpoint using fetch and JSON.

OPENAI API TEST LOG (2024-06-12):
- Created test-openai.js to verify OpenAI API key and connectivity using the openai npm package and dotenv.
- Successfully tested chat completion with GPT-4, confirming backend can access OpenAI services.

DEBUGGING & SYSTEM VERIFICATION LOG (2024-06-12):
- Verified yt-dlp and ffmpeg are installed and accessible from the command line.
- Confirmed backend server is running and listening on port 3001.
- Debugged and resolved issues with missing OPENAI_API_KEY and package dependencies.
- Confirmed end-to-end flow: user submits link, backend downloads video, converts to WAV, transcribes with Whisper, and returns transcript to frontend for display.

FUTURE FEATURE LOG (2024-06-12):
- Planned for future implementation: async job queue/status endpoint for polling transcript progress and improving user experience for long-running jobs.

UI/UX IMPROVEMENT LOG (2024-06-12):
- Moved status row (spinner and status text) below the submit button for better layout and clarity.
- Spinner now appears to the right of a cycling status text with 50 nerdy/terminal-style phrases during loading.
- Status text defaults to 'Ready for BS scan' when idle.
- Improved word wrapping for transcript results.
- Added a paste button inside the input field for quick clipboard pasting.
- Integrated full favicon suite for cross-device/browser compatibility.

FRONTEND TRANSCRIPT/ANALYSIS UI UPDATE LOG (2024-06-13):
- Updated frontend result rendering logic in backend/public/javascripts/main.js.
- Transcript and analysis are no longer rendered together inside the collapsible box.
- Now, the analysis (from transcriptJson) is rendered as a visible block above the collapsible.
- The collapsible box (now labeled "Transcript") contains only the transcript text.
- This improves clarity: users see the analysis summary and sources immediately, and can expand to view the full transcript.
- All changes committed and pushed to GitHub for traceability.
- Debug logging was added and then removed as needed during troubleshooting.

CREATIVE-BLACK-HOLE ANIMATION INTEGRATION LOG (2024-06-13):
- Integrated the creative-black-hole animation as a full-page background overlay during processing (after form submit, before API response).
- Added <a-hole> custom element to index.html, hidden by default and styled to cover the viewport.
- Initially attempted dynamic import of creative-black-hole.js, but switched to static <script type="module"> import for reliability and to ensure custom element registration on page load.
- Debugged canvas sizing issues: animation was initializing with zero size when hidden, causing OffscreenCanvas errors.
- Final solution: on show, remove and re-add the <a-hole> element to the DOM before setting display:block, forcing correct initialization and canvas sizing.
- Progress bar, status text, and all UI elements remain visible above the animation.
- All changes tested and confirmed working; logs and error handling improved for future debugging. 