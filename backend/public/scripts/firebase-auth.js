// --- CREDIT SYSTEM ---
const CREDIT_KEY = 'guest_credits';
const CREDIT_DATE_KEY = 'guest_credits_date';
const GUEST_CREDITS_PER_DAY = 1;
const USER_CREDITS_PER_DAY = 6; // 1 base + 5 bonus

const creditStatusEl = document.getElementById('credit-status');

function getTodayString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function resetGuestCreditsIfNeeded() {
  const today = getTodayString();
  const lastDate = localStorage.getItem(CREDIT_DATE_KEY);
  if (lastDate !== today) {
    localStorage.setItem(CREDIT_KEY, GUEST_CREDITS_PER_DAY);
    localStorage.setItem(CREDIT_DATE_KEY, today);
  }
}

function getGuestCredits() {
  resetGuestCreditsIfNeeded();
  return parseInt(localStorage.getItem(CREDIT_KEY) || '0', 10);
}

function decrementGuestCredits() {
  let credits = getGuestCredits();
  if (credits > 0) {
    credits -= 1;
    localStorage.setItem(CREDIT_KEY, credits);
  }
  return credits;
}

function updateCreditStatusUI(credits, isLoggedIn) {
  if (isLoggedIn) {
    creditStatusEl.textContent = `Credits: ${credits}/6`;
  } else {
    creditStatusEl.textContent = `Credits: ${credits}/1 (guest)`;
  }
}

// --- FIREBASE USER CREDIT LOGIC ---
async function getUserCredits(user) {
  const db = firebase.firestore();
  const docRef = db.collection('user_credits').doc(user.uid);
  const today = getTodayString();
  const doc = await docRef.get();
  if (!doc.exists || doc.data().date !== today) {
    // Reset credits for new day
    await docRef.set({ credits: USER_CREDITS_PER_DAY, date: today });
    return USER_CREDITS_PER_DAY;
  }
  return doc.data().credits;
}

async function decrementUserCredits(user) {
  const db = firebase.firestore();
  const docRef = db.collection('user_credits').doc(user.uid);
  const doc = await docRef.get();
  const today = getTodayString();
  if (!doc.exists || doc.data().date !== today) {
    await docRef.set({ credits: USER_CREDITS_PER_DAY - 1, date: today });
    return USER_CREDITS_PER_DAY - 1;
  }
  let credits = doc.data().credits;
  if (credits > 0) {
    credits -= 1;
    await docRef.update({ credits });
  }
  return credits;
}

// --- MAIN CREDIT HANDLER ---
let currentUser = null;

async function refreshCredits() {
  if (currentUser) {
    const credits = await getUserCredits(currentUser);
    updateCreditStatusUI(credits, true);
  } else {
    const credits = getGuestCredits();
    updateCreditStatusUI(credits, false);
  }
}

// Hook into auth state changes
firebase.auth().onAuthStateChanged(async (user) => {
  currentUser = user;
  await refreshCredits();
});

// Expose for submission logic
window.getAvailableCredits = async function() {
  if (currentUser) {
    return await getUserCredits(currentUser);
  } else {
    return getGuestCredits();
  }
};

window.decrementCredits = async function() {
  if (currentUser) {
    return await decrementUserCredits(currentUser);
  } else {
    return decrementGuestCredits();
  }
};

// On page load
refreshCredits();

window.refreshCredits = refreshCredits; 