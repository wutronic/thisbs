document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('transcribe-form');
  const input = document.getElementById('video-url');
  const spinner = document.getElementById('spinner');
  const result = document.getElementById('result');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    result.textContent = '';
    spinner.style.display = 'block';
    form.querySelector('button').disabled = true;
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: input.value })
      });
      const data = await res.json();
      if (data.transcript) {
        result.innerHTML = `<div class="transcript-title">Transcript</div><pre>${escapeHtml(data.transcript)}</pre>`;
      } else {
        result.innerHTML = `<span style="color:#f87171;">${escapeHtml(data.error || 'Transcription failed.')}</span>`;
      }
    } catch (err) {
      result.innerHTML = '<span style="color:#f87171;">Network error.</span>';
    }
    spinner.style.display = 'none';
    form.querySelector('button').disabled = false;
  });

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (c) {
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