const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function convertToWav(inputPath, outputDir) {
  const outputPath = path.join(outputDir, `audio_${Date.now()}.wav`);
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      '-i', inputPath,
      '-vn',
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      outputPath
    ]);
    ffmpeg.on('error', reject);
    ffmpeg.stderr.on('data', () => {});
    ffmpeg.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        reject(new Error('Audio conversion failed.'));
      }
    });
  });
}

module.exports = { convertToWav }; 