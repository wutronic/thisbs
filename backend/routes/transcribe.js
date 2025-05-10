const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const os = require('os');
const { downloadVideo, isLikelyArticleUrl, isInstagramUrl, downloadInstagramMedia, isImageUrl, downloadImage, extractTextFromImage } = require('../videoDownloader');
const { convertToMp3 } = require('../audioConverter');
const { transcribeAudio } = require('../whisperClient');
const OpenAI = require('openai');
const { scrapeArticleText } = require('../articleScraper');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory map for SSE connections
const progressStreams = {};

// SSE endpoint for progress updates
router.get('/progress/:id', (req, res) => {
  const jobId = req.params.id;
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();
  progressStreams[jobId] = res;
  req.on('close', () => {
    delete progressStreams[jobId];
  });
});

function emitProgress(jobId, stepIndex, message) {
  const stream = progressStreams[jobId];
  if (stream) {
    stream.write(`data: ${JSON.stringify({ stepIndex, message })}\n\n`);
  }
}

// POST /api/transcribe
router.post('/', async (req, res) => {
  const jobId = uuidv4();
  res.setHeader('X-Job-Id', jobId);
  console.log('DEBUG: /api/transcribe route hit');
  const { videoUrl, claimText } = req.body;
  if (!videoUrl) {
    console.log('DEBUG: Missing videoUrl in request body.');
    return res.status(400).json({ error: 'Missing videoUrl in request body.' });
  }
  console.log('DEBUG: Input validation passed. videoUrl:', videoUrl, 'claimText:', claimText);
  const tempDir = os.tmpdir();
  let videoPath, mp3Path;
  try {
    let transcript;
    emitProgress(jobId, 0, 'Validating input');
    if (isImageUrl(videoUrl)) {
      emitProgress(jobId, 1, 'Downloading image');
      console.log('DEBUG: Detected image URL, downloading image...');
      const imagePath = await downloadImage(videoUrl, tempDir);
      emitProgress(jobId, 2, 'Image downloaded, running OCR');
      transcript = await extractTextFromImage(imagePath);
      emitProgress(jobId, 5, 'Image text extracted');
      console.log('DEBUG: Image text extracted, length:', transcript.length);
    } else if (isLikelyArticleUrl(videoUrl)) {
      emitProgress(jobId, 1, 'Scraping article text');
      console.log('DEBUG: Detected article URL, scraping text...');
      transcript = await scrapeArticleText(videoUrl);
      emitProgress(jobId, 5, 'Article text scraped');
      console.log('DEBUG: Article text scraped, length:', transcript.length);
    } else if (isInstagramUrl(videoUrl)) {
      emitProgress(jobId, 1, 'Downloading Instagram media');
      console.log('DEBUG: Detected Instagram URL, using metadownloader...');
      const { outputPath, mediaType } = await downloadInstagramMedia(videoUrl, tempDir);
      emitProgress(jobId, 2, `Instagram media downloaded (${mediaType})`);
      console.log('DEBUG: Instagram media downloaded:', outputPath, 'Type:', mediaType);
      if (mediaType === 'video') {
        emitProgress(jobId, 3, 'Converting audio');
        console.log('DEBUG: Starting audio conversion to MP3...');
        mp3Path = await convertToMp3(outputPath, tempDir);
        emitProgress(jobId, 4, 'Audio converted to MP3');
        console.log('DEBUG: Audio converted to MP3:', mp3Path);
        // File size check (25MB limit)
        const stats = fs.statSync(mp3Path);
        if (stats.size > 25 * 1024 * 1024) {
          emitProgress(jobId, 4, 'Audio too long');
          console.log('DEBUG: MP3 file too large:', stats.size);
          return res.status(400).json({ error: 'audio too long, we appologize, if you donate or subscribe we can get resources to fix this, thank you for your patience.' });
        }
        emitProgress(jobId, 5, 'Transcribing audio');
        console.log('DEBUG: Starting transcription...');
        transcript = await transcribeAudio(mp3Path);
        emitProgress(jobId, 6, 'Transcription complete');
        console.log('DEBUG: Transcription complete. Transcript length:', transcript.length);
      } else if (mediaType === 'image') {
        emitProgress(jobId, 3, 'Running OCR on image');
        console.log('DEBUG: Starting OCR on Instagram image...');
        transcript = await extractTextFromImage(outputPath);
        emitProgress(jobId, 5, 'Image text extracted');
        console.log('DEBUG: Image text extracted, length:', transcript.length);
      } else {
        emitProgress(jobId, 3, 'Unsupported Instagram media type');
        console.log('DEBUG: Unsupported Instagram media type:', mediaType);
        return res.status(400).json({ error: 'Unsupported Instagram media type: ' + mediaType });
      }
    } else {
      emitProgress(jobId, 1, 'Downloading video');
      console.log('DEBUG: Starting video download...');
      videoPath = await downloadVideo(videoUrl, tempDir);
      emitProgress(jobId, 2, 'Video downloaded');
      console.log('DEBUG: Video downloaded:', videoPath);
      emitProgress(jobId, 3, 'Converting audio');
      console.log('DEBUG: Starting audio conversion to MP3...');
      mp3Path = await convertToMp3(videoPath, tempDir);
      emitProgress(jobId, 4, 'Audio converted to MP3');
      console.log('DEBUG: Audio converted to MP3:', mp3Path);
      // File size check (25MB limit)
      const stats = fs.statSync(mp3Path);
      if (stats.size > 25 * 1024 * 1024) {
        emitProgress(jobId, 4, 'Audio too long');
        console.log('DEBUG: MP3 file too large:', stats.size);
        return res.status(400).json({ error: 'audio too long, we appologize, if you donate or subscribe we can get resources to fix this, thank you for your patience.' });
      }
      emitProgress(jobId, 5, 'Transcribing audio');
      console.log('DEBUG: Starting transcription...');
      transcript = await transcribeAudio(mp3Path);
      emitProgress(jobId, 6, 'Transcription complete');
      console.log('DEBUG: Transcription complete. Transcript length:', transcript.length);
    }

    // New: Analyze transcript with OpenAI and get JSON structure
    let transcriptJson = null;
    emitProgress(jobId, 7, 'Analyzing transcript');
    const analysisPrompt = `You are an expert analyst trained in dialectics and source evaluation. Your job is to listen to or read claims made in a video and create the strongest, most persuasive ("steelman") versions of each major position. For each claim made, follow these steps:

    1. Identify distinct positions or interpretations of the claim. There should be a supporting and contrarian position.

    2. Find the most trusted sources who know the most on that subject.

    3. For each position, act as the most trusted source identified in step 2. Construct the strongest, most logical version of the argument (steelman it). Before presenting the argument, use this format:
    "The Claim you intend to expand on"
    "claim argument"

    4. Make sure you go into detail on each claim, find their main positions, and write AT LEAST 2 paragraphs per position or more if necessary to explain.

    Constraints:
    - For every claim, find both the position that strengthens it and a contrarian perspective.
    - make sure the sources you chose are citing sources that are credible, if not please notate they are not credible or unconfirmed. if the sources have been proven to lie, call this out.
    - You MUST go in-depth with at least 2 paragraphs per claim (not counting sources).
    - For every claim, there MUST be an agreeing position and a contrary position.
    - where you se claim_1 in JSON means it should state the actualy claim being debated, not the literal text.
    - for every source in "top sources" section add a link to the article you are sourcing, if there is no link to the article add a link to the publication. format will be: [publication or source] : http://thelink.com
    - if the source is know to lie, or has been kownn to lie, please notate (not credible because of: give reason)
    - absolutely no markdown formatting, just plain text.

    5. Output the result in strict JSON format. No extra commentary. No prose. where you see "label": "Position 1",  "Position 1"  is not a literal header that says  "Position 1"  but in fact the position that they are argueing for in a simple and easy to understand header.

    Output JSON structure (always follow this exactly):
"top_sources": ["Source A", "Source B", "Source C"]


    {
      "claim_1": {
        "positions": [
          {
            "label": "Position 1",
            "steelman": "Strongest possible version of the first viewpoint.",
             "top_sources": [
                { "name": "Source A", "url": "http://www.sourcea.com" },
                { "name": "Source B", "url": "http://www.sourceb.com" }
                { "name": "Source C", "url": "http://www.sourcec.com" }
              ]
          },
          {
            "label": "Position 2",
            "steelman": "Strongest possible version of the second viewpoint.",
             "top_sources": [
                { "name": "Source D", "url": "http://www.sourced.com" },
                { "name": "Source E", "url": "http://www.sourcee.com" }
                { "name": "Source F", "url": "http://www.sourcef.com" }
            ]
          }
        ]
      },
      "claim_2": {
        "positions": [
          {
            "label": "Position 1",
            "steelman": "Best articulation of the single known position.",
             "top_sources": [
                { "name": "Source X", "url": "http://www.sourcex.com" },
                { "name": "Source Y", "url": "http://www.sourcey.com" }
                { "name": "Source Z", "url": "http://www.sourcez.com" }
            ]
          },
          {
            "label": "Position 2",
            "steelman": "Strongest possible version of the second viewpoint.",
             "top_sources": [
                { "name": "Source Q, "url": "http://www.sourceq.com" },
                { "name": "Source R", "url": "http://www.sourcer.com" }
                { "name": "Source S", "url": "http://www.sources.com" }
            ]
          }
        ]
      }
    }

    Keep going with this JSON format, We should support up to 3 claims at a time.

    Analyze the following transcript and output only the JSON:`;
    try {
      emitProgress(jobId, 8, 'Calling OpenAI for analysis');
      console.log('DEBUG: Starting OpenAI analysis call...');
      const analysisResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: analysisPrompt + '\n\n Constraints: Only respond to this specific claim in the followingtranscript \n\n ' + transcript }
        ]
      });
      // Log the raw response for debugging
      console.log('DEBUG: Raw OpenAI analysis response:', analysisResponse.choices[0].message.content);
      // Try to parse the JSON from the response
      const jsonMatch = analysisResponse.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('DEBUG: Extracted JSON string:', jsonMatch[0]);
        transcriptJson = JSON.parse(jsonMatch[0]);
        emitProgress(jobId, 9, 'Analysis complete');
        console.log('DEBUG: Parsed transcriptJson:', transcriptJson);
      } else {
        throw new Error('Could not extract JSON from OpenAI response.');
      }
    } catch (err) {
      emitProgress(jobId, 9, 'Analysis failed');
      console.log('DEBUG: OpenAI analysis call failed:', err);
      return res.status(500).json({ error: 'Failed to analyze transcript as JSON: ' + (err.message || err.toString()) });
    }

    // Second OpenAI call: claim check with web search
    let claimCheck = null;
    let prompt = '';
    if (claimText && claimText.trim()) {
      prompt = `check the validity of these claims: ${claimText.trim()}\n\nTranscript:\n${transcript}`;
    } else {
      prompt = `check the validity of these claims\n\nTranscript:\n${transcript}`;
    }
    try {
      emitProgress(jobId, 10, 'Calling OpenAI for claim check');
      console.log('DEBUG: Starting OpenAI claim check call...');
      const response = await openai.responses.create({
        model: 'gpt-4o',
        tools: [{ type: 'web_search_preview' }],
        input: prompt
      });
      claimCheck = response.output_text;
      emitProgress(jobId, 11, 'Claim check complete');
      console.log('DEBUG: Claim check result:', claimCheck);
    } catch (err) {
      emitProgress(jobId, 11, 'Claim check failed');
      claimCheck = 'Error checking claim (web search): ' + (err.message || err.toString());
      console.log('DEBUG: Claim check failed:', err);
    }

    // Log for debugging
    emitProgress(jobId, 12, 'Finalizing');
    console.log('DEBUG: Final API response:', { transcript, transcriptJson, claimCheck });
    res.json({ transcript, transcriptJson, claimCheck, jobId });
  } catch (err) {
    emitProgress(jobId, 99, 'Error occurred');
    let msg = err.message;
    if (msg && msg.includes('Requested format is not available')) {
      msg = 'requested format not available yet';
    }
    console.log('DEBUG: Error in main handler:', err);
    res.status(400).json({ error: msg });
  } finally {
    if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (mp3Path && fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
    // End SSE stream if open
    if (progressStreams[jobId]) {
      progressStreams[jobId].end();
      delete progressStreams[jobId];
    }
  }
});

module.exports = router; 