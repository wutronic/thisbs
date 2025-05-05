const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const os = require('os');
const { downloadVideo } = require('../videoDownloader');
const { convertToWav } = require('../audioConverter');
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
  let videoPath, wavPath;
  try {
    console.log('DEBUG: Starting video download...');
    videoPath = await downloadVideo(videoUrl, tempDir);
    console.log('DEBUG: Video downloaded:', videoPath);
    console.log('DEBUG: Starting audio conversion...');
    wavPath = await convertToWav(videoPath, tempDir);
    console.log('DEBUG: Audio converted:', wavPath);
    console.log('DEBUG: Starting transcription...');
    const transcript = await transcribeAudio(wavPath);
    console.log('DEBUG: Transcription complete. Transcript length:', transcript.length);

    // New: Analyze transcript with OpenAI and get JSON structure
    let transcriptJson = null;
    const analysisPrompt = `You are an expert analyst trained in dialectics and source evaluation. Your job is to listen to or read claims made in a video and create the strongest, most persuasive ("steelman") versions of each major position. For each claim made, follow these steps:\n\t1.\tIdentify distinct positions or interpretations of the claim. If there is only one, say so explicitly.\n\t2.\tFor each position, construct the strongest, most logical version of the argument (steelman it).\n\t3.\tIdentify and list the top 3 most trusted and relevant sources or figures that might best represent each position.\n\t4.\tOutput the result in strict JSON format. No extra commentary. No prose.\n\nOutput JSON structure (always follow this exactly):\n\n{\n  "claim_1": {\n    "positions": [\n      {\n        "label": "Position 1",\n        "steelman": "Strongest possible version of the first viewpoint.",\n        "top_sources": ["Source A", "Source B", "Source C"]\n      },\n      {\n        "label": "Position 2",\n        "steelman": "Strongest possible version of the second viewpoint.",\n        "top_sources": ["Source D", "Source E", "Source F"]\n      }\n    ]\n  },\n  "claim_2": {\n    "positions": [\n      {\n        "label": "Only Position",\n        "steelman": "Best articulation of the single known position.",\n        "top_sources": ["Source X", "Source Y", "Source Z"]\n      }\n    ]\n  }\n}\n\nAnalyze the following transcript and output only the JSON:`;
    try {
      console.log('DEBUG: Starting OpenAI analysis call...');
      const analysisResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: analysisPrompt + '\n\n' + transcript }
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
    console.log('DEBUG: Final API response:', { transcriptJson, claimCheck });
    res.json({ transcriptJson, claimCheck });
  } catch (err) {
    console.log('DEBUG: Error in main handler:', err);
    res.status(500).json({ error: err.message || 'Transcription failed.' });
  } finally {
    if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (wavPath && fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
  }
});

module.exports = router; 