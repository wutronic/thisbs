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
  const settingsBtn = document.getElementById('settings-btn');
  const claimGroup = document.querySelector('.claim-group');
  const particlesBg = document.getElementById('particles-bg');
  if (claimGroup) {
    claimGroup.classList.remove('js-hide');
  }
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
    progressContainer.style.display = 'block';
  }

  function resetProgress() {
    progressBar.style.width = '0%';
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
    }, 3000);
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

  function showParticlesBg() {
    if (particlesBg) particlesBg.classList.remove('hidden');
  }
  function hideParticlesBg() {
    if (particlesBg) particlesBg.classList.add('hidden');
  }

  // === CREDIT SYSTEM LOGIC ===
  const creditStatus = document.getElementById('credit-status');
  let currentCredits = null;
  let isCreditExhausted = false;

  async function fetchCredits() {
    try {
      // Always use user-credit endpoints due to mock auth
      const res = await fetch('/users/user-credit');
      if (!res.ok) throw new Error('Failed to fetch credits');
      const data = await res.json();
      currentCredits = data.credits;
      updateCreditStatus();
      console.log('[CREDITS] Fetched credits:', currentCredits);
      if (currentCredits <= 0) {
        disableFormForCredits();
      } else {
        enableFormForCredits();
      }
    } catch (err) {
      creditStatus.textContent = 'Error fetching credits';
      creditStatus.style.color = '#f87171';
      console.error('[CREDITS] Error fetching credits:', err);
    }
  }

  async function decrementCredits() {
    try {
      const res = await fetch('/users/user-credit', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to decrement credits');
      const data = await res.json();
      currentCredits = data.credits;
      updateCreditStatus();
      console.log('[CREDITS] Decremented credits, now:', currentCredits);
      if (currentCredits <= 0) {
        disableFormForCredits();
      }
    } catch (err) {
      creditStatus.textContent = 'Error decrementing credits';
      creditStatus.style.color = '#f87171';
      console.error('[CREDITS] Error decrementing credits:', err);
    }
  }

  function updateCreditStatus() {
    if (currentCredits === null) {
      creditStatus.textContent = '';
      return;
    }
    creditStatus.textContent = `Credits: ${currentCredits}`;
    creditStatus.style.color = currentCredits > 0 ? '#fff' : '#f87171';
  }

  function disableFormForCredits() {
    isCreditExhausted = true;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add('button-disabled');
    input.disabled = true;
    claimInput.disabled = true;
    creditStatus.textContent = 'No credits left. Please wait for reset or log in.';
    creditStatus.style.color = '#f87171';
    console.log('[CREDITS] Credits exhausted, form disabled');
  }

  function enableFormForCredits() {
    isCreditExhausted = false;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.classList.remove('button-disabled');
    input.disabled = false;
    claimInput.disabled = false;
    updateCreditStatus();
    console.log('[CREDITS] Credits available, form enabled');
  }

  // Fetch credits on page load
  fetchCredits();

  // Patch form submit handler to decrement credits after successful /api/transcribe
  const origFormSubmit = form.onsubmit;
  form.addEventListener('submit', async function (e) {
    if (isCreditExhausted) {
      e.preventDefault();
      return;
    }
    // Let the original handler run
    if (origFormSubmit) origFormSubmit(e);
    // Wait for /api/transcribe to finish (hook into result rendering)
    // Use MutationObserver to detect result rendering
    const container = form.parentNode;
    const observer = new MutationObserver(async (mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.classList && node.classList.contains('result')) {
              // Only decrement credits if transcript or transcriptJson present
              if (node.innerHTML.includes('collapsible-transcript') || node.innerHTML.includes('claim-blocks-wrapper')) {
                await decrementCredits();
              }
              observer.disconnect();
              return;
            }
          }
        }
      }
    });
    observer.observe(container, { childList: true });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    // Animate container to top
    const centeredContainer = document.getElementById('centered-container');
    if (centeredContainer) {
      centeredContainer.classList.remove('centered');
      centeredContainer.classList.add('top-anchored');
    }
    console.log('Submitting form...');
    if (result) {
      result.remove();
      result = null;
    }
    showBlackhole();
    hideParticlesBg();
    if (logoImg) logoImg.style.display = 'none';
    if (logoVideo) logoVideo.style.display = 'block';
    spinner.style.display = 'block';
    startStatusCycle();
    console.log('Status cycle started');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add('button-disabled');
    let progressSource = null;
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
      // --- SSE progress bar logic ---
      if (data.jobId) {
        progressSource = new EventSource(`/api/progress/${data.jobId}`);
        progressSource.onmessage = function (event) {
          try {
            const { stepIndex } = JSON.parse(event.data);
            if (typeof stepIndex === 'number') setProgress(stepIndex);
            if (stepIndex === 12 || stepIndex === 99) {
              progressSource.close();
            }
          } catch (e) {}
        };
        progressSource.onerror = function () {
          if (progressSource) progressSource.close();
        };
      }
      setProgress(progressSteps.length - 1); // Ensure 100% on finish
      console.log('transcriptJson received:', data.transcriptJson);
      result = document.createElement('div');
      result.className = 'result';
      let html = '';
      // Render analysis above the collapsible if present
      if (data.transcriptJson) {
        html += renderTranscriptJsonWithConfetti(data.transcriptJson);
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
        // Ensure smooth transition by forcing reflow when toggling
        content.addEventListener('transitionend', function handler(e) {
          if (!content.classList.contains('expanded')) {
            content.style.maxHeight = null;
          }
        });
      }
      console.log('Result rendered and collapsible logic attached.');
    } catch (err) {
      stopProgressBar();
      if (progressSource) progressSource.close();
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
      showParticlesBg();
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

  function autoLinkSources(text) {
    // Replace each line like 'Name: URL' with a clickable link (name only)
    return text.replace(/([^:]+):\s*(https?:\/\/[^\s]+)/g, function(_, name, url) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(name.trim())}</a>`;
    });
  }

  function renderTranscriptJson(json) {
    console.log('renderTranscriptJson input:', json);
    let html = '';
    for (const claimKey in json) {
      if (!json.hasOwnProperty(claimKey)) continue;
      const claim = json[claimKey];
      html += `<div class=\"claim-title\"><b>${escapeHtml(claimKey.replace(/_/g, ' '))}</b></div>`;
      let blocksHtml = '';
      if (Array.isArray(claim.positions)) {
        claim.positions.forEach(pos => {
          blocksHtml += `<div class=\"claim-block\">`;
          blocksHtml += `<div class=\"position-block\" style=\"margin-left:1em;margin-bottom:2em;\">`;
          blocksHtml += `<div class=\"position-label\"><b>${escapeHtml(pos.label)}</b></div>`;
          blocksHtml += `<blockquote class=\"steelman\">${escapeHtml(pos.steelman)}</blockquote>`;
          if (Array.isArray(pos.top_sources)) {
            blocksHtml += '<div class=\"sources-title\">Top Sources:</div><ul class=\"sources-list\">';
            pos.top_sources.forEach(src => {
              if (typeof src === 'string') {
                // If the source matches 'Name: URL', auto-link it
                if (/^([^:]+):\s*(https?:\/\/[^\s]+)$/.test(src)) {
                  blocksHtml += `<li>${autoLinkSources(src)}</li>`;
                } else {
                  blocksHtml += `<li>${escapeHtml(src)}</li>`;
                }
              } else if (src && typeof src === 'object' && src.name && src.url) {
                blocksHtml += `<li><a href=\"${escapeHtml(src.url)}\" target=\"_blank\" rel=\"noopener noreferrer\">${escapeHtml(src.name)}</a></li>`;
              } else {
                blocksHtml += `<li>${escapeHtml(String(src))}</li>`;
                console.warn('Unknown top_source format:', src);
              }
            });
            blocksHtml += '</ul>';
          }
          blocksHtml += `</div>`;
          blocksHtml += `</div>`;
        });
      }
      html += `<div class=\"claim-blocks-wrapper\">${blocksHtml}</div>`;
    }
    return html;
  }

  function renderTranscriptJsonWithConfetti(json) {
    console.log('renderTranscriptJsonWithConfetti called');
    const html = renderTranscriptJson(json);
    setTimeout(() => {
      scrollToResults();
      setTimeout(triggerClaimConfetti, 400);
    }, 800);
    return html;
  }

  if (settingsBtn && claimGroup) {
    settingsBtn.addEventListener('click', function () {
      claimGroup.classList.toggle('expanded');
    });
  }

  // === Confetti Effect Integration ===
  (function() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let confetti = [];
    let sequins = [];
    // Smaller, denser, more colorful, slower confetti
    const defaultConfettiCount = 160;
    const defaultSequinCount = 64;
    const gravityConfetti = 0.25;
    const gravitySequins = 0.0275;
    const dragConfetti = 0.06;
    const dragSequins = 0.001;
    const terminalVelocity = 2.5;
    const colors = [
      { front: '#7b5cff', back: '#6245e0' }, // Purple
      { front: '#b3c7ff', back: '#8fa5e5' }, // Light Blue
      { front: '#5c86ff', back: '#345dd1' }, // Blue
      { front: '#ff5c8a', back: '#d1345b' }, // Pink/Red
      { front: '#ffd166', back: '#e0a800' }, // Yellow/Gold
      { front: '#06d6a0', back: '#118c7e' }, // Teal/Green
      { front: '#ff9f1c', back: '#ffbf69' }, // Orange
      { front: '#2ec4b6', back: '#1b9c8c' }, // Aqua
    ];
    function randomRange(min, max) { return Math.random() * (max - min) + min; }
    function initConfettoVelocity(xRange, yRange) {
      const x = randomRange(xRange[0], xRange[1]);
      const range = yRange[1] - yRange[0] + 1;
      let y = yRange[1] - Math.abs(randomRange(0, range) + randomRange(0, range) - range);
      if (y >= yRange[1] - 1) {
        y += (Math.random() < .25) ? randomRange(1, 3) : 0;
      }
      return {x: x, y: -y};
    }
    function Confetto(origin, spreadW, spreadH) {
      this.randomModifier = randomRange(0, 99);
      this.color = colors[Math.floor(randomRange(0, colors.length))];
      // Smaller confetti
      this.dimensions = {
        x: randomRange(9, 18),
        y: randomRange(14, 28),
      };
      this.position = {
        x: origin.x + randomRange(-spreadW/2, spreadW/2),
        y: origin.y + randomRange(-spreadH/2, spreadH/2),
      };
      this.rotation = randomRange(0, 2 * Math.PI);
      this.scale = { x: 1, y: 1 };
      this.velocity = initConfettoVelocity([-9, 9], [6, 11]);
    }
    Confetto.prototype.update = function() {
      this.velocity.x -= this.velocity.x * dragConfetti;
      this.velocity.y = Math.min(this.velocity.y + gravityConfetti, terminalVelocity);
      // Subtle random X drift
      this.velocity.x += (Math.random() > 0.5 ? Math.random() : -Math.random()) * 0.3;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      // Gentle wind effect
      this.position.x += Math.sin((this.position.y + this.randomModifier) * 0.008) * 0.8;
      // Natural wobble (flip both ways)
      this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.006);
    };
    function Sequin(origin, spreadW, spreadH) {
      this.color = colors[Math.floor(randomRange(0, colors.length))].back;
      this.radius = randomRange(2, 4);
      this.position = {
        x: origin.x + randomRange(-spreadW/2, spreadW/2),
        y: origin.y + randomRange(-spreadH/2, spreadH/2),
      };
      this.velocity = {
        x: randomRange(-6, 6),
        y: randomRange(-8, -12)
      };
    }
    Sequin.prototype.update = function() {
      this.velocity.x -= this.velocity.x * dragSequins;
      this.velocity.y = this.velocity.y + gravitySequins;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    };
    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confetti.forEach((confetto, index) => {
        let width = (confetto.dimensions.x * confetto.scale.x);
        let height = (confetto.dimensions.y * confetto.scale.y);
        ctx.save();
        ctx.translate(confetto.position.x, confetto.position.y);
        ctx.rotate(confetto.rotation);
        confetto.update();
        ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.restore();
      });
      sequins.forEach((sequin, index) => {
        ctx.save();
        ctx.translate(sequin.position.x, sequin.position.y);
        sequin.update();
        ctx.fillStyle = sequin.color;
        ctx.beginPath();
        ctx.arc(0, 0, sequin.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });
      confetti = confetti.filter(c => c.position.y < canvas.height);
      sequins = sequins.filter(s => s.position.y < canvas.height);
      if (confetti.length > 0 || sequins.length > 0) {
        window.requestAnimationFrame(renderConfetti);
      }
    }
    window.triggerConfettiAt = function(x, y, spreadW = 300, spreadH = 100) {
      for (let i = 0; i < defaultConfettiCount; i++) {
        confetti.push(new Confetto({x, y}, spreadW, spreadH));
      }
      for (let i = 0; i < defaultSequinCount; i++) {
        sequins.push(new Sequin({x, y}, spreadW, spreadH));
      }
      renderConfetti();
    };
    // Resize canvas on window resize
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  })();

  // === Trigger confetti after results render ===
  function triggerClaimConfetti() {
    const claimBlocks = document.querySelectorAll('.claim-block');
    console.log('triggerClaimConfetti called, found', claimBlocks.length, 'blocks');
    claimBlocks.forEach((block, i) => {
      const rect = block.getBoundingClientRect();
      const x = rect.left + rect.width / 2 + window.scrollX;
      const y = rect.top + rect.height / 2 + window.scrollY;
      const width = rect.width;
      const height = rect.height;
      console.log(`Confetti at (${x}, ${y}) for block`, i, 'size', width, height);
      setTimeout(() => {
        if (window.triggerConfettiAt) window.triggerConfettiAt(x, y, width, height);
      }, i * 350);
    });
  }
  function scrollToResults() {
    const firstBlock = document.querySelector('.claim-block');
    if (firstBlock) {
      console.log('Scrolling to first claim block');
      firstBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.log('No claim block found to scroll to');
    }
  }
  const origRenderTranscriptJson = renderTranscriptJson;
  window.renderTranscriptJson = function(json) {
    console.log('Patched renderTranscriptJson called');
    const html = origRenderTranscriptJson(json);
    setTimeout(() => {
      scrollToResults();
      setTimeout(triggerClaimConfetti, 400);
    }, 800);
    return html;
  };

  // === Manual Confetti and Fake Claim Block Testing ===
  window.populateFakeClaims = function() {
    const container = document.querySelector('.container') || document.body;
    let fakeResult = document.getElementById('fake-claim-result');
    if (fakeResult) fakeResult.remove();
    fakeResult = document.createElement('div');
    fakeResult.id = 'fake-claim-result';
    fakeResult.style.marginTop = '2rem';
    fakeResult.innerHTML = `
      <div class="claim-title"><b>Fake Claim 1</b></div>
      <div class="claim-blocks-wrapper">
        <div class="claim-block"><div class="position-block"><div class="position-label"><b>Position A</b></div><blockquote class="steelman">Steelman argument for A.</blockquote></div></div>
        <div class="claim-block"><div class="position-block"><div class="position-label"><b>Position B</b></div><blockquote class="steelman">Steelman argument for B.</blockquote></div></div>
        <div class="claim-block"><div class="position-block"><div class="position-label"><b>Position C</b></div><blockquote class="steelman">Steelman argument for C.</blockquote></div></div>
      </div>
      <div class="claim-title"><b>Fake Claim 2</b></div>
      <div class="claim-blocks-wrapper">
        <div class="claim-block"><div class="position-block"><div class="position-label"><b>Position X</b></div><blockquote class="steelman">Steelman argument for X.</blockquote></div></div>
        <div class="claim-block"><div class="position-block"><div class="position-label"><b>Position Y</b></div><blockquote class="steelman">Steelman argument for Y.</blockquote></div></div>
      </div>
    `;
    container.appendChild(fakeResult);
    console.log('Fake claim blocks populated.');
  };
  window.testClaimConfetti = function() {
    console.log('Triggering confetti on all .claim-blocks');
    triggerClaimConfetti();
  };
  window.populateAndConfetti = function() {
    window.populateFakeClaims();
    setTimeout(window.testClaimConfetti, 500);
  };
}); 