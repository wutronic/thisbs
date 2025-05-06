const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const os = require('os');
const { downloadVideo } = require('../videoDownloader');
const { convertToMp3 } = require('../audioConverter');
const { transcribeAudio } = require('../whisperClient');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/transcribe
router.post('/', async (req, res) => {
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
    console.log('DEBUG: Starting video download...');
    videoPath = await downloadVideo(videoUrl, tempDir);
    console.log('DEBUG: Video downloaded:', videoPath);
    console.log('DEBUG: Starting audio conversion to MP3...');
    mp3Path = await convertToMp3(videoPath, tempDir);
    console.log('DEBUG: Audio converted to MP3:', mp3Path);
    // File size check (25MB limit)
    const stats = fs.statSync(mp3Path);
    if (stats.size > 25 * 1024 * 1024) {
      console.log('DEBUG: MP3 file too large:', stats.size);
      return res.status(400).json({ error: 'audio too long, we appologize, if you donate or subscribe we can get resources to fix this, thank you for your patience.' });
    }
    console.log('DEBUG: Starting transcription...');
    const transcript = await transcribeAudio(mp3Path);
    console.log('DEBUG: Transcription complete. Transcript length:', transcript.length);

    // New: Analyze transcript with OpenAI and get JSON structure
    let transcriptJson = null;
    const analysisPrompt = `You are an expert analyst trained in dialectics and source evaluation. Your job is to listen to or read claims made in a video and create the strongest, most persuasive ("steelman") versions of each major position. For each claim made, follow these steps:\n\t1.\tIdentify distinct positions or interpretations of the claim. .\n\t2.\tFor each position, construct the strongest, most logical version of the argument (steelman it), before going into the argument use this format for the text "The Claim you intend to expand on"\n "claim argument" ".\n\t3.\tIdentify and list the top 3 most trusted and relevant sources or figures that might best represent each position. Make sure you go into detail on each claim, find their main positions and write at least 2 paragraps or more if necessary to explain. constraints: make sure you go in depth and at least 2 paragraphs per claim.\n\t4.\tOutput the result in strict JSON format. No extra commentary. No prose. \n\nOutput JSON structure (always follow this exactly):\n\n{\n  "claim_1": {\n    "positions": [\n      {\n        "label": "Position 1",\n        "steelman": "Strongest possible version of the first viewpoint.",\n        "top_sources": ["Source A", "Source B", "Source C"]\n      },\n      {\n        "label": "Position 2",\n        "steelman": "Strongest possible version of the second viewpoint.",\n        "top_sources": ["Source D", "Source E", "Source F"]\n      }\n    ]\n  },\n  "claim_2": {\n    "positions": [\n      {\n        "label": "Only Position",\n        "steelman": "Best articulation of the single known position.",\n        "top_sources": ["Source X", "Source Y", "Source Z"]\n      }\n    ]\n  }\n}\n\nAnalyze the following transcript and output only the JSON:`;
    try {
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
        transcriptJson = JSON.parse(jsonMatch[0]);
        console.log('DEBUG: Parsed transcriptJson:', transcriptJson);
      } else {
        throw new Error('Could not extract JSON from OpenAI response.');
      }
    } catch (err) {
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
      console.log('DEBUG: Starting OpenAI claim check call...');
      const response = await openai.responses.create({
        model: 'gpt-4o',
        tools: [{ type: 'web_search_preview' }],
        input: prompt
      });
      claimCheck = response.output_text;
      console.log('DEBUG: Claim check result:', claimCheck);
    } catch (err) {
      claimCheck = 'Error checking claim (web search): ' + (err.message || err.toString());
      console.log('DEBUG: Claim check failed:', err);
    }

    // Log for debugging
    console.log('DEBUG: Final API response:', { transcript, transcriptJson, claimCheck });
    res.json({ transcript, transcriptJson, claimCheck });
  } catch (err) {
    console.log('DEBUG: Error in main handler:', err);
    res.status(500).json({ error: err.message || 'Transcription failed.' });
  } finally {
    if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (mp3Path && fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
  }
});

module.exports = router; 