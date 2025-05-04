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
  const { videoUrl, claimText } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing videoUrl in request body.' });
  }
  const tempDir = os.tmpdir();
  let videoPath, wavPath;
  try {
    videoPath = await downloadVideo(videoUrl, tempDir);
    wavPath = await convertToWav(videoPath, tempDir);
    const transcript = await transcribeAudio(wavPath);

    // Second OpenAI call: claim check with web search
    let claimCheck = null;
    let prompt = '';
    if (claimText && claimText.trim()) {
      prompt = `check the validity of these claims: ${claimText.trim()}\n\nTranscript:\n${transcript}`;
    } else {
      prompt = `check the validity of these claims\n\nTranscript:\n${transcript}`;
    }
    try {
      const response = await openai.responses.create({
        model: 'gpt-4o',
        tools: [{ type: 'web_search_preview' }],
        input: prompt
      });
      claimCheck = response.output_text;
    } catch (err) {
      claimCheck = 'Error checking claim (web search): ' + (err.message || err.toString());
    }

    // Log the transcript and claimCheck before sending response
    console.log('Transcript:', transcript);
    console.log('ClaimCheck:', claimCheck);
    res.json({ transcript, claimCheck });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Transcription failed.' });
  } finally {
    if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (wavPath && fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
  }
});

module.exports = router; 