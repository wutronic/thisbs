form.addEventListener('submit', async function (e) {
  e.preventDefault();
  // Credit check before proceeding
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.classList.add('button-disabled');
  const credits = await window.getAvailableCredits();
  if (credits <= 0) {
    // Show error and abort
    spinner.style.display = 'none';
    stopStatusCycle && stopStatusCycle();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'result';
    errorDiv.innerHTML = '<span style="color:#f87171;">You have reached your daily credit limit. Please sign in or come back tomorrow.</span>';
    form.parentNode.appendChild(errorDiv);
    submitBtn.disabled = false;
    submitBtn.classList.remove('button-disabled');
    return;
  }
  const guestId = localStorage.getItem('guest_id');
  console.log('[DEBUG] About to decrement credits. guest_id:', guestId);
  const decResult = await window.decrementCredits();
  console.log('[DEBUG] decrementCredits() result:', decResult);
  await window.refreshCredits && window.refreshCredits();
  console.log('[DEBUG] After refreshCredits, UI shows:', document.getElementById('credit-status').textContent);
  // ... existing code ...
}); 