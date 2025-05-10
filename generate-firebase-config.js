// generate-firebase-config.js
// Usage: node generate-firebase-config.js
// Reads public Firebase config from .env and writes backend/public/firebase-config.js

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from project root
const envPath = path.resolve(__dirname, '.env');
const env = dotenv.parse(fs.readFileSync(envPath));

// Only include public Firebase config keys
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

const output = `window.FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig, null, 2)};\n`;
const outPath = path.resolve(__dirname, 'backend/public/firebase-config.js');
fs.writeFileSync(outPath, output);
console.log('Generated backend/public/firebase-config.js'); 