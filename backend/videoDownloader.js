const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const metadownloader = require('metadownloader');
const { createWorker } = require('tesseract.js');
const { fileTypeFromFile } = require('file-type');
const sharp = require('sharp');
const { franc } = require('franc-min');
console.log('[DEBUG] file-type module export:', fileTypeFromFile);
console.log('[DEBUG] typeof fromFile:', typeof fileTypeFromFile.fromFile);
const { fromFile } = fileTypeFromFile;

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

function isLikelyArticleUrl(url) {
  // List of known video domains
  const videoDomains = [
    'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'twitch.tv',
    'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com', 'soundcloud.com'
  ];
  // List of known video/audio file extensions
  const videoExts = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.mp3', '.wav', '.aac', '.flac'];
  const lower = url.toLowerCase();
  if (videoDomains.some(domain => lower.includes(domain))) return false;
  if (videoExts.some(ext => lower.endsWith(ext))) return false;
  return true;
}

function isInstagramUrl(url) {
  return /instagram\.com\//i.test(url);
}

async function downloadInstagramMedia(mediaUrl, outputDir) {
  console.log('[InstagramDL] Using metadownloader for:', mediaUrl);
  const result = await metadownloader(mediaUrl);
  if (!result || !result.status || !result.data || !result.data[0] || !result.data[0].url) {
    throw new Error('Failed to get Instagram media URL from metadownloader.');
  }
  const mediaDirectUrl = result.data[0].url;
  // Try to detect type from metadownloader result or file extension
  let mediaType = 'unknown';
  if (result.data[0].type) {
    mediaType = result.data[0].type; // e.g., 'video', 'image'
  } else {
    // Fallback: infer from file extension
    if (/\.(mp4|mov|webm)$/i.test(mediaDirectUrl)) mediaType = 'video';
    else if (/\.(jpe?g|png|gif|bmp|webp|tiff?)$/i.test(mediaDirectUrl)) mediaType = 'image';
  }
  const ext = (mediaDirectUrl.match(/\.(mp4|mov|webm|jpe?g|png|gif|bmp|webp|tiff?)(?=($|\?))/i) || ['','.bin'])[0];
  const outputPath = path.join(outputDir, `insta_${Date.now()}${ext}`);
  console.log('[InstagramDL] Downloading from direct URL:', mediaDirectUrl);
  const response = await axios({
    method: 'GET',
    url: mediaDirectUrl,
    responseType: 'stream',
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  if (!fs.existsSync(outputPath)) {
    throw new Error('Instagram media download failed.');
  }
  // Validate file type using file-type
  let detectedType = 'unknown';
  let ft = null;
  try {
    ft = await fileTypeFromFile(outputPath);
    if (ft) {
      if (ft.mime.startsWith('video/')) detectedType = 'video';
      else if (ft.mime.startsWith('image/')) detectedType = 'image';
    }
  } catch (e) {
    console.log('[InstagramDL] file-type detection failed:', e);
  }
  // Prefer detectedType over mediaType if available
  if (detectedType !== 'unknown') mediaType = detectedType;
  if (mediaType === 'unknown') {
    // Log all relevant info for debugging
    let fileSize = 0;
    try { fileSize = fs.statSync(outputPath).size; } catch {}
    console.log('[InstagramDL] UNKNOWN MEDIA TYPE');
    console.log('  metadownloader result:', JSON.stringify(result, null, 2));
    console.log('  direct URL:', mediaDirectUrl);
    console.log('  file path:', outputPath);
    console.log('  file size:', fileSize);
    if (ft) console.log('  file-type result:', ft);
  }
  console.log('[InstagramDL] Download complete:', outputPath, 'Type:', mediaType);
  return { outputPath, mediaType };
}

function isImageUrl(url) {
  // Check for common image extensions
  return /\.(png|jpe?g|gif|bmp|webp|tiff?)($|\?)/i.test(url);
}

async function downloadImage(url, outputDir) {
  const ext = (url.match(/\.(png|jpe?g|gif|bmp|webp|tiff?)(?=($|\?))/i) || ['','.png'])[0];
  const outputPath = path.join(outputDir, `img_${Date.now()}${ext}`);
  console.log('[ImageDL] Downloading image:', url);
  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  if (!fs.existsSync(outputPath)) {
    throw new Error('Image download failed.');
  }
  console.log('[ImageDL] Download complete:', outputPath);
  return outputPath;
}

async function preprocessImageForOCR(inputPath, outputPath) {
  // Preprocess: grayscale, increase contrast, binarize, remove alpha, upscale if small
  let image = sharp(inputPath).grayscale();
  // Remove alpha channel if present
  image = image.removeAlpha();
  // Increase contrast (simple linear stretch)
  image = image.linear(1.2, -20); // adjust as needed
  // Binarize (threshold)
  image = image.threshold(180); // adjust threshold as needed
  // Optionally upscale if width < 600px
  const metadata = await sharp(inputPath).metadata();
  if (metadata.width && metadata.width < 600) {
    image = image.resize({ width: 600 });
  }
  await image.toFile(outputPath);
  return outputPath;
}

function filterOcrText(text) {
  // Try splitting on newlines, then fallback to splitting on punctuation/whitespace if only one line
  let lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    // Fallback: split on punctuation or whitespace
    lines = text.split(/[.,;:!?\-\|\[\](){}\s]+/).map(l => l.trim()).filter(Boolean);
  }
  const filtered = [];
  const removed = [];
  for (const line of lines) {
    if (line.length < 8) {
      removed.push({ reason: 'too short', line });
      continue;
    }
    const alphaCount = (line.match(/[a-zA-Z0-9]/g) || []).length;
    if (alphaCount / line.length < 0.6) {
      removed.push({ reason: 'low alphanumeric ratio', line });
      continue;
    }
    filtered.push(line);
  }
  console.log('[OCR] filterOcrText RAW lines:', lines);
  if (removed.length > 0) {
    console.log('[OCR] Filtered out lines:', removed);
  }
  // Block-level language detection (optional, recommended)
  const block = filtered.join(' ');
  if (block.length >= 50) {
    const lang = franc(block);
    if (lang !== 'eng') {
      console.log('[OCR] Block-level language detection: not English, returning unfiltered OCR output. Block:', block);
      return text;
    }
  }
  if (filtered.length === 0 && lines.length > 0) {
    // Fallback: return the longest line with highest alphanumeric ratio
    let best = lines[0];
    let bestScore = 0;
    for (const line of lines) {
      const alphaCount = (line.match(/[a-zA-Z0-9]/g) || []).length;
      const score = (alphaCount / line.length) * line.length;
      if (score > bestScore) {
        best = line;
        bestScore = score;
      }
    }
    console.log('[OCR] All lines filtered, returning fallback:', best);
    return best;
  }
  return filtered.join('\n');
}

async function extractTextFromImage(imagePath) {
  const preprocessedPath = imagePath + '_preprocessed.png';
  await preprocessImageForOCR(imagePath, preprocessedPath);
  const { createWorker } = require('tesseract.js');
  const psmList = [6, 7, 11];
  let bestText = '';
  let bestPsm = null;
  for (const psm of psmList) {
    const worker = await createWorker('eng');
    await worker.setParameters({ tessedit_pageseg_mode: psm });
    const { data } = await worker.recognize(preprocessedPath);
    await worker.terminate();
    const text = data.text.trim();
    console.log(`[OCR] PSM ${psm} RAW output:`, text);
    const filtered = filterOcrText(text);
    console.log(`[OCR] PSM ${psm} filtered output:`, filtered);
    // Heuristic: pick the first output with >20 chars and at least 60% alphanumeric
    const alphaCount = (filtered.match(/[a-zA-Z0-9]/g) || []).length;
    if (filtered.length > 20 && alphaCount / filtered.length > 0.6) {
      bestText = filtered;
      bestPsm = psm;
      break;
    }
    if (filtered.length > bestText.length) {
      bestText = filtered;
      bestPsm = psm;
    }
  }
  if (!bestText || bestText.length < 10) {
    throw new Error('OCR failed to extract meaningful text from image.');
  }
  console.log(`[OCR] Best PSM: ${bestPsm}, Best output:`, bestText);
  return bestText;
}

module.exports = { downloadVideo, isLikelyArticleUrl, isInstagramUrl, downloadInstagramMedia, isImageUrl, downloadImage, extractTextFromImage, preprocessImageForOCR }; 