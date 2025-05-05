document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('transcribe-form');
  const input = document.getElementById('video-url');
  const claimInput = document.getElementById('claim-text');
  const spinner = document.getElementById('spinner');
  const pasteBtn = document.getElementById('paste-btn');
  const statusText = document.getElementById('status-text');
  let result = null;
  let statusInterval = null;

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

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Submitting form...');
    if (result) {
      result.remove();
      result = null;
    }
    spinner.style.display = 'block';
    startStatusCycle();
    console.log('Status cycle started');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add('button-disabled');
    try {
      console.log('Sending fetch to /api/transcribe...');
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: input.value,
          claimText: claimInput.value
        })
      });
      console.log('Fetch completed, status:', res.status);
      const data = await res.json();
      console.log('Data received:', data);
      result = document.createElement('div');
      result.className = 'result';
      let html = '';
      if (data.transcriptJson) {
        html += `
          <div class="collapsible-transcript">
            <div class="collapsible-header" tabindex="0">Transcript Analysis &#9660;</div>
            <div class="collapsible-content" style="display:none;">${renderTranscriptJson(data.transcriptJson)}</div>
          </div>
        `;
      }
      if (data.claimCheck) {
        html += `<div class=\"transcript-title\" style=\"margin-top:1.5rem;\">Claim Check</div><pre>${escapeHtml(data.claimCheck)}</pre>`;
      }
      if (!data.transcriptJson && !data.claimCheck) {
        html = `<span style=\"color:#f87171;\">${escapeHtml(data.error || 'Transcription failed.')}</span>`;
      }
      result.innerHTML = html;
      form.parentNode.appendChild(result);

      // Add expand/collapse logic
      const header = result.querySelector('.collapsible-header');
      const content = result.querySelector('.collapsible-content');
      if (header && content) {
        header.addEventListener('click', function () {
          const isOpen = content.style.display === 'block';
          content.style.display = isOpen ? 'none' : 'block';
          header.innerHTML = `Transcript Analysis ${isOpen ? '&#9660;' : '&#9650;'}`;
        });
        header.addEventListener('keypress', function (e) {
          if (e.key === 'Enter' || e.key === ' ') header.click();
        });
      }
      console.log('Result rendered and collapsible logic attached.');
    } catch (err) {
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
    let html = '';
    for (const claimKey in json) {
      if (!json.hasOwnProperty(claimKey)) continue;
      const claim = json[claimKey];
      html += `<div class=\"claim-block\"><div class=\"claim-title\"><b>${escapeHtml(claimKey.replace(/_/g, ' '))}</b></div>`;
      if (Array.isArray(claim.positions)) {
        claim.positions.forEach(pos => {
          html += `<div class=\"position-block\" style=\"margin-left:1em;margin-bottom:1em;\">`;
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