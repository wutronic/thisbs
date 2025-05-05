const express = require('express');
const router = express.Router();

// In-memory map for job SSE connections (to be filled in next steps)
const jobStreams = {};

// SSE endpoint for progress updates
router.get('/:id', (req, res) => {
  const jobId = req.params.id;
  // Set headers for SSE
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  // Store the response object for this job
  jobStreams[jobId] = res;

  // Clean up on client disconnect
  req.on('close', () => {
    delete jobStreams[jobId];
  });
});

module.exports = { router, jobStreams }; 