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
  }

  function stopStatusCycle() {
    if (statusInterval) clearInterval(statusInterval);
    statusText.textContent = 'Ready for BS scan';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (result) {
      result.remove();
      result = null;
    }
    spinner.style.display = 'block';
    startStatusCycle();
    form.querySelector('button[type="submit"]').disabled = true;
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: input.value,
          claimText: claimInput.value
        })
      });
      const data = await res.json();
      result = document.createElement('div');
      result.className = 'result';
      let html = '';
      if (data.transcript) {
        html += `
          <div class="collapsible-transcript">
            <div class="collapsible-header" tabindex="0">Transcript &#9660;</div>
            <div class="collapsible-content" style="display:none;"><pre>${escapeHtml(data.transcript)}</pre></div>
          </div>
        `;
      }
      if (data.claimCheck) {
        html += `<div class=\"transcript-title\" style=\"margin-top:1.5rem;\">Claim Check</div><pre>${escapeHtml(data.claimCheck)}</pre>`;
      }
      if (!data.transcript && !data.claimCheck) {
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
          header.innerHTML = `Transcript ${isOpen ? '&#9660;' : '&#9650;'}`;
        });
        header.addEventListener('keypress', function (e) {
          if (e.key === 'Enter' || e.key === ' ') header.click();
        });
      }
    } catch (err) {
      result = document.createElement('div');
      result.className = 'result';
      result.innerHTML = '<span style=\"color:#f87171;\">Network error.</span>';
      form.parentNode.appendChild(result);
    }
    spinner.style.display = 'none';
    stopStatusCycle();
    form.querySelector('button[type="submit"]').disabled = false;
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
}); 