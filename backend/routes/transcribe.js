const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const os = require('os');
const { downloadVideo } = require('../videoDownloader');
const { convertToWav } = require('../audioConverter');
const { transcribeAudio } = require('../whisperClient');

// POST /api/transcribe
router.post('/', async (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing videoUrl in request body.' });
  }
  const tempDir = os.tmpdir();
  let videoPath, wavPath;
  try {
    videoPath = await downloadVideo(videoUrl, tempDir);
    wavPath = await convertToWav(videoPath, tempDir);
    const transcript = await transcribeAudio(wavPath);
    res.json({ transcript });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Transcription failed.' });
  } finally {
    if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (wavPath && fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
  }
});

module.exports = router; 