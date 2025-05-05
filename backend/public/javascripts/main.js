document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('transcribe-form');
  const input = document.getElementById('video-url');
  const claimInput = document.getElementById('claim-text');
  const spinner = document.getElementById('spinner');
  const pasteBtn = document.getElementById('paste-btn');
  const statusText = document.getElementById('status-text');
  const logoImg = document.getElementById('logo-img');
  const logoVideo = document.getElementById('logo-video');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');
  let result = null;
  let statusInterval = null;
  let progressInterval;

  const statusPhrases = [
    'Initializing BS scan...',
    'Algorithm initialized',
    'BS detector: booting',
    'Loading heuristics...',
    'Analyzing entropy...',
    'Parsing input stream',
    'Spinning up AI core',
    'Allocating RAM for nonsense',
    'Running /usr/bin/bsdetector',
    'Checking for logical fallacies',
    'Compiling sarcasm module',
    'Mounting /dev/bs',
    'Decrypting obfuscation',
    'Piping output to /dev/null',
    'Engaging snark protocol',
    'Calibrating skepticism sensors',
    'Hashing input for truthiness',
    'Launching quantum sniffer',
    'Evaluating semantic payload',
    'Measuring signal-to-noise',
    'Running sudo bsctl --scan',
    'Checking for circular logic',
    'Analyzing with grep -i "bs"',
    'Spooling up neural net',
    'Decoding jargon',
    'Inspecting with strace',
    'Running AI sarcasm filter',
    'Checking for buzzwords',
    'Measuring hype factor',
    'Running top | grep "nonsense"',
    'Analyzing with awk',
    'Launching snarkd',
    'Checking for vaporware',
    'Running make sense',
    'Patching logic holes',
    'Scanning for red herrings',
    'Running tail -f /var/log/bs',
    'Checking for infinite loops',
    'Running AI skepticism',
    'Analyzing with sed',
    'Running netstat for truth leaks',
    'Checking for snake oil',
    'Running AI facepalm',
    'Analyzing with cat /dev/bs',
    'Running AI eye-roll',
    'Checking for quantum uncertainty',
    'Running AI snicker',
    'Analyzing with grep -E "truth|bs"',
    'Running AI double-take',
    'Finalizing scan...'
  ];

  // Scalable progress steps array
  const progressSteps = [
    'Validating input',
    'Downloading video',
    'Converting audio',
    'Checking file size',
    'Transcribing audio',
    'Analyzing transcript',
    'Finalizing'
  ];

  function setProgress(stepIndex) {
    const percent = Math.round((stepIndex / (progressSteps.length - 1)) * 100);
    progressBar.style.width = percent + '%';
    progressLabel.textContent = progressSteps[stepIndex] || '';
    progressContainer.style.display = 'block';
  }

  function resetProgress() {
    progressBar.style.width = '0%';
    progressLabel.textContent = '';
    progressContainer.style.display = 'none';
  }

  pasteBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    try {
      const text = await navigator.clipboard.readText();
      input.value = text;
      input.focus();
    } catch (err) {
      alert('Could not read clipboard.');
    }
  });

  function startStatusCycle() {
    let idx = 0;
    statusText.textContent = statusPhrases[0];
    statusInterval = setInterval(() => {
      idx = (idx + 1) % statusPhrases.length;
      statusText.textContent = statusPhrases[idx];
    }, 1200);
    console.log('startStatusCycle: interval started');
  }

  function stopStatusCycle() {
    if (statusInterval) {
      clearInterval(statusInterval);
      console.log('stopStatusCycle: interval cleared');
    }
    statusText.textContent = 'Ready for BS scan';
  }

  // Helper to show/hide black hole animation
  const blackholeBg = document.getElementById('blackhole-bg');
  function showBlackhole() {
    console.log('[Blackhole] showBlackhole called');
    // Remove and re-add the element to force re-initialization
    if (blackholeBg.parentNode) {
      blackholeBg.parentNode.removeChild(blackholeBg);
    }
    document.body.insertBefore(blackholeBg, document.body.firstChild);
    blackholeBg.style.display = 'block';
    void blackholeBg.offsetWidth; // Force reflow
    blackholeBg.classList.remove('fade-out');
    blackholeBg.classList.add('fade-in');
    console.log('[Blackhole] fade-in class added');
    window.dispatchEvent(new Event('resize'));
  }
  function hideBlackhole() {
    blackholeBg.classList.remove('fade-in');
    blackholeBg.classList.add('fade-out');
    console.log('[Blackhole] fade-out class added');
    blackholeBg.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'opacity') {
        blackholeBg.style.display = 'none';
        blackholeBg.removeEventListener('transitionend', handler);
        console.log('[Blackhole] transitionend, display set to none');
      }
    });
    console.log('[Blackhole] blackholeBg hidden');
  }

  function startProgressBar() {
    let step = 0;
    setProgress(step);
    progressInterval = setInterval(() => {
      step++;
      if (step < progressSteps.length - 2) { // Stop at penultimate step
        setProgress(step);
      } else {
        clearInterval(progressInterval);
        setProgress(progressSteps.length - 2); // Hold at last visible step
      }
    }, 600);
  }
  function stopProgressBar() {
    setProgress(progressSteps.length - 1); // Jump to 100%
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Submitting form...');
    if (result) {
      result.remove();
      result = null;
    }
    showBlackhole();
    if (logoImg) logoImg.style.display = 'none';
    if (logoVideo) logoVideo.style.display = 'block';
    spinner.style.display = 'block';
    startStatusCycle();
    console.log('Status cycle started');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add('button-disabled');
    try {
      startProgressBar();
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: input.value,
          claimText: claimInput.value
        })
      });
      stopProgressBar();
      console.log('Fetch completed, status:', res.status);
      const data = await res.json();
      setProgress(progressSteps.length - 1); // Ensure 100% on finish
      console.log('transcriptJson received:', data.transcriptJson);
      result = document.createElement('div');
      result.className = 'result';
      let html = '';
      // Render analysis above the collapsible if present
      if (data.transcriptJson) {
        html += renderTranscriptJson(data.transcriptJson);
      }
      // Collapsible contains only the transcript
      if (data.transcript) {
        html += `
          <div class=\"collapsible-transcript\">
            <div class=\"collapsible-header\" tabindex=\"0\">Transcript &#9660;</div>
            <div class=\"collapsible-content\">
              <div class=\"transcript-title\" style=\"margin-top:1.5rem;\">Transcript</div><pre>${escapeHtml(data.transcript)}</pre>
            </div>
          </div>
        `;
      }
      if (!data.transcriptJson && !data.transcript) {
        html = `<span style=\"color:#f87171;\">${escapeHtml(data.error || 'Transcription failed.')}</span>`;
      }
      result.innerHTML = html;
      form.parentNode.appendChild(result);

      // Add expand/collapse logic
      const header = result.querySelector('.collapsible-header');
      const content = result.querySelector('.collapsible-content');
      if (header && content) {
        header.addEventListener('click', function () {
          const isOpen = content.classList.contains('expanded');
          if (isOpen) {
            content.classList.remove('expanded');
            header.innerHTML = `Transcript &#9660;`;
          } else {
            content.classList.add('expanded');
            header.innerHTML = `Transcript &#9650;`;
          }
        });
        header.addEventListener('keypress', function (e) {
          if (e.key === 'Enter' || e.key === ' ') header.click();
        });
      }
      console.log('Result rendered and collapsible logic attached.');
    } catch (err) {
      stopProgressBar();
      console.error('Error during fetch or render:', err);
      result = document.createElement('div');
      result.className = 'result';
      result.innerHTML = '<span style=\"color:#f87171;\">Network error.</span>';
      form.parentNode.appendChild(result);
    } finally {
      spinner.style.display = 'none';
      stopStatusCycle();
      console.log('Status cycle stopped, UI reset');
      submitBtn.disabled = false;
      submitBtn.classList.remove('button-disabled');
      if (logoVideo) logoVideo.style.display = 'none';
      if (logoImg) logoImg.style.display = 'block';
      setTimeout(resetProgress, 2000); // Hide progress bar after short delay
      hideBlackhole();
    }
  });

  function escapeHtml(text) {
    return text.replace(/[&<>"]'/g, function (c) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[c];
    });
  }

  function renderTranscriptJson(json) {
    console.log('renderTranscriptJson input:', json);
    let html = '';
    for (const claimKey in json) {
      if (!json.hasOwnProperty(claimKey)) continue;
      const claim = json[claimKey];
      html += `<div class=\"claim-block\"><div class=\"claim-title\"><b>${escapeHtml(claimKey.replace(/_/g, ' '))}</b></div>`;
      if (Array.isArray(claim.positions)) {
        claim.positions.forEach(pos => {
          html += `<div class=\"position-block\" style=\"margin-left:1em;margin-bottom:2em;\">`;
          html += `<div class=\"position-label\"><b>${escapeHtml(pos.label)}</b></div>`;
          html += `<blockquote class=\"steelman\">${escapeHtml(pos.steelman)}</blockquote>`;
          if (Array.isArray(pos.top_sources)) {
            html += '<div class=\"sources-title\">Top Sources:</div><ul class=\"sources-list\">';
            pos.top_sources.forEach(src => {
              html += `<li>${escapeHtml(src)}</li>`;
            });
            html += '</ul>';
          }
          html += `</div>`;
        });
      }
      html += `</div>`;
    }
    return html;
  }
}); 