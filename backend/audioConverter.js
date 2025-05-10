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

async function convertToMp3(inputPath, outputDir) {
  const outputPath = path.join(outputDir, `audio_${Date.now()}.mp3`);
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      '-i', inputPath,
      '-vn',
      '-ar', '16000',
      '-ac', '1',
      '-b:a', '128k',
      '-f', 'mp3',
      outputPath
    ]);
    let stderr = '';
    ffmpeg.on('error', reject);
    ffmpeg.stderr.on('data', (data) => { stderr += data.toString(); });
    ffmpeg.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        const errMsg = 'Audio conversion to MP3 failed.' + (stderr ? ('\nffmpeg stderr:\n' + stderr) : '');
        reject(new Error(errMsg));
      }
    });
  });
}

module.exports = { convertToWav, convertToMp3 }; 