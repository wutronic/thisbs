// Usage: node test-openai.js
// Ensure you have a valid OPENAI_API_KEY in your .env file

require('dotenv').config();
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function run() {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: 'Write a one-sentence bedtime story about a unicorn.' }
      ]
    });
    console.log('Response:', response.choices[0].message.content);
  } catch (err) {
    console.error('Error:', err);
  }
}

run(); 