const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');
const fs = require('fs');

async function downloadVideo(videoUrl, outputDir) {
  const ytdlp = new YtDlp({
    binaryPath: '/opt/homebrew/bin/yt-dlp',
  });
  const outputPath = path.join(outputDir, `video_${Date.now()}.mp4`);
  await ytdlp.downloadAsync(videoUrl, {
    format: {
      filter: 'audioandvideo',
      type: 'mp4',
      quality: 'highest',
    },
    output: outputPath,
  });
  if (!fs.existsSync(outputPath)) {
    throw new Error('Video download failed.');
  }
  return outputPath;
}

module.exports = { downloadVideo }; 