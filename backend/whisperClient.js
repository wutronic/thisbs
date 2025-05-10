const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

async function transcribeAudio(wavPath) {
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY in environment.');
  const form = new FormData();
  form.append('file', fs.createReadStream(wavPath));
  form.append('model', 'whisper-1');

  const response = await axios.post(WHISPER_API_URL, form, {
    headers: {
      ...form.getHeaders(),
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    maxBodyLength: Infinity,
  });
  return response.data.text;
}

module.exports = { transcribeAudio }; 