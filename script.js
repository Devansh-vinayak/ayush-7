// ===== Starfield + Moon =====
const starsLayer = document.getElementById('stars');
if (starsLayer) {
  // create stars only once
  if (!starsLayer.dataset.initialized) {
    for (let i = 0; i < 120; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() * 2.4 + 0.6;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.top = Math.random() * 100 + '%';
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDuration = (1.5 + Math.random() * 3) + 's';
      s.style.animationDelay = Math.random() * 3 + 's';
      starsLayer.appendChild(s);
    }
    const moon = document.createElement('div');
    moon.className = 'moon';
    starsLayer.appendChild(moon);
    starsLayer.dataset.initialized = 'true';
  }
}

// ===== Floating hearts =====
function spawnHeart() {
  const h = document.createElement('div');
  h.className = 'float-heart';
  h.textContent = ['♥', '❤', '💕'][Math.floor(Math.random() * 3)];
  h.style.left = Math.random() * 100 + 'vw';
  h.style.bottom = '-20px';
  const dur = 7 + Math.random() * 6;
  h.style.animationDuration = dur + 's';
  h.style.fontSize = (12 + Math.random() * 14) + 'px';
  document.body.appendChild(h);
  setTimeout(() => h.remove(), dur * 1000);
}
setInterval(spawnHeart, 900);
for (let i = 0; i < 4; i++) setTimeout(spawnHeart, i * 300);

// ===== Butterflies =====
function spawnButterfly() {
  const b = document.createElement('div');
  b.className = 'butterfly';
  b.textContent = '🦋';
  b.style.left = (10 + Math.random() * 80) + 'vw';
  b.style.top = (15 + Math.random() * 60) + 'vh';
  b.style.animationDuration = (3 + Math.random() * 2) + 's';
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 6000);
}
setInterval(spawnButterfly, 2500);

// ===== Background music with cross-page continuity =====
const BG_TIME_KEY = 'ourStoryBgMusicTime';
const BG_PLAYING_KEY = 'ourStoryBgMusicPlaying';
let bgAudio = null;
let audioControl = null;
let _firstInteractionBound = false;

function createAudioControl() {
  if (audioControl) return;
  audioControl = document.createElement('div');
  audioControl.id = 'audioControl';
  audioControl.style.position = 'fixed';
  audioControl.style.right = '18px';
  audioControl.style.bottom = '18px';
  audioControl.style.zIndex = '9999';
  audioControl.style.background = 'rgba(0,0,0,0.45)';
  audioControl.style.color = '#fff';
  audioControl.style.padding = '8px 10px';
  audioControl.style.borderRadius = '20px';
  audioControl.style.fontFamily = 'Quicksand, sans-serif';
  audioControl.style.display = 'flex';
  audioControl.style.alignItems = 'center';
  audioControl.style.gap = '8px';
  audioControl.style.cursor = 'pointer';
  audioControl.innerHTML = '<span id="audioIcon">🔈</span><span style="font-size:13px">Play music</span>';
  audioControl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!bgAudio) return;
    if (bgAudio.paused) {
      bgAudio.play().catch(() => {});
    } else {
      bgAudio.pause();
    }
    updateAudioControl();
  });
  document.body.appendChild(audioControl);
}

function updateAudioControl() {
  if (!audioControl || !bgAudio) return;
  const icon = audioControl.querySelector('#audioIcon');
  const label = audioControl.querySelector('span:nth-child(2)');
  if (bgAudio.paused) {
    icon.textContent = '🔇';
    label.textContent = 'Play music';
  } else {
    icon.textContent = '🔊';
    label.textContent = 'Pause music';
  }
}

function bindFirstInteractionPlay() {
  if (_firstInteractionBound) return;
  const startOnFirstInteraction = () => {
    if (bgAudio && bgAudio.paused) {
      bgAudio.play().catch(() => {});
      updateAudioControl();
    }
  };
  window.addEventListener('click', startOnFirstInteraction, { once: true });
  window.addEventListener('keydown', startOnFirstInteraction, { once: true });
  _firstInteractionBound = true;
}

function setupPersistentAudio() {
  // If an audio element with id bgMusic already exists, keep it. Otherwise create one at top of body.
  bgAudio = document.getElementById('bgMusic');
  if (!bgAudio) {
    // create one and prepend to body
    bgAudio = document.createElement('audio');
    bgAudio.id = 'bgMusic';
    // default src - use encoded URI to handle spaces
    bgAudio.src = encodeURI('WhatsApp Audio 2026-06-28 at 04.22.30.mpeg');
    bgAudio.preload = 'auto';
    bgAudio.crossOrigin = 'anonymous';
    bgAudio.loop = false;
    document.body.prepend(bgAudio);
  } else {
    // remove duplicate audio elements if there are multiple
    const audios = document.querySelectorAll('audio');
    if (audios.length > 1) {
      audios.forEach((a) => {
        if (a.id !== 'bgMusic') a.remove();
      });
    }
    // ensure src is encoded
    try { bgAudio.src = encodeURI(bgAudio.src.split('/').pop()); } catch (e) {}
    bgAudio.preload = 'auto';
  }

  // ensure not muted
  try { bgAudio.muted = false; } catch (e) {}

  // add control UI
  createAudioControl();

  // restore time and playing state
  const savedTime = parseFloat(localStorage.getItem(BG_TIME_KEY));
  const savedPlaying = localStorage.getItem(BG_PLAYING_KEY) === 'true';
  if (!Number.isNaN(savedTime) && savedTime > 0) {
    try { bgAudio.currentTime = savedTime; } catch (e) { /* ignore */ }
  }

  // try to play if previously playing
  const tryPlay = () => {
    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // autoplay blocked - bind first user interaction to play
        bindFirstInteractionPlay();
      }).then(() => updateAudioControl()).catch(()=>{});
    }
  };

  bgAudio.volume = 0.6;
  if (savedPlaying) tryPlay();

  // save time and playing state periodically
  const saveState = () => {
    try {
      localStorage.setItem(BG_TIME_KEY, bgAudio.currentTime.toString());
      localStorage.setItem(BG_PLAYING_KEY, (!bgAudio.paused).toString());
    } catch (e) { }
  };

  bgAudio.addEventListener('play', () => { saveState(); updateAudioControl(); });
  bgAudio.addEventListener('pause', () => { saveState(); updateAudioControl(); });
  bgAudio.addEventListener('timeupdate', () => {
    // throttle saves
    if (!bgAudio._lastSaved || Date.now() - bgAudio._lastSaved > 700) {
      saveState();
      bgAudio._lastSaved = Date.now();
    }
  });

  window.addEventListener('pagehide', () => {
    saveState();
  });

  // ensure first-interaction binder is ready so single click to advance also allows play
  bindFirstInteractionPlay();
}

// Initialize persistent audio right away
setupPersistentAudio();

// ===== SPA-style navigation to keep audio playing between slides =====
async function ajaxNavigate(url, push = true) {
  try {
    const resp = await fetch(url, { credentials: 'same-origin' });
    if (!resp.ok) throw new Error('fetch failed');
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Replace the #stage content so layout updates without reload
    const newStage = doc.getElementById('stage');
    if (newStage) {
      const stage = document.getElementById('stage');
      if (stage) {
        stage.innerHTML = newStage.innerHTML;
      }
    }

    // Update body dataset nextPage
    const newNext = doc.body.dataset.nextPage;
    if (newNext !== undefined) {
      document.body.dataset.nextPage = newNext;
    } else {
      delete document.body.dataset.nextPage;
    }

    // Update document title
    if (doc.title) document.title = doc.title;

    // Re-run any initialization that depends on new DOM
    initFinalSurprise();

    // Update URL in address bar
    if (push) history.pushState({ path: url }, '', url);
  } catch (e) {
    // fallback to full navigation
    window.location.href = url;
  }
}

// intercept clicks to do in-place navigation
document.addEventListener('click', (event) => {
  const clickedLink = event.target.closest('a');
  const body = document.body;
  const nextPage = body.dataset.nextPage;

  // If user clicked an actual link, allow default (anchors should still work)
  if (clickedLink) return;

  if (!nextPage) return;

  // Prevent navigation for clicks on interactive elements
  if (event.target.closest('.navRow') || event.target.closest('button') || event.target.closest('input') || event.target.closest('a')) return;

  event.preventDefault();

  // If audio is paused, attempt to play (useful because many users click to advance)
  if (bgAudio && bgAudio.paused) {
    bgAudio.play().catch(() => {});
  }

  ajaxNavigate(nextPage);
});

// handle back/forward
window.addEventListener('popstate', (e) => {
  const path = location.pathname.split('/').pop() || 'index.html';
  ajaxNavigate(path, false);
});

// ===== Click-to-continue on story pages (kept for backward compatibility) =====
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundMusic();
  initFinalSurprise();
});

function initBackgroundMusic() {
  // kept for compatibility - audio is already set up in setupPersistentAudio
  if (!bgAudio) setupPersistentAudio();
  const savedTime = parseFloat(localStorage.getItem(BG_TIME_KEY));
  if (!Number.isNaN(savedTime) && savedTime > 0) {
    try { bgAudio.currentTime = savedTime; } catch (e) { }
  }
}

// ===== Final surprise box =====
function initFinalSurprise() {
  const giftBox = document.getElementById('giftBox');
  const reveal = document.getElementById('surpriseReveal');
  if (!giftBox || !reveal) return;

  const openGift = () => {
    giftBox.classList.add('open');
    reveal.classList.add('show');
    launchFireworks();
    for (let i = 0; i < 8; i++) {
      setTimeout(() => spawnHeart(), i * 180);
    }
  };

  giftBox.addEventListener('click', openGift);
  giftBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openGift();
    }
  });

  setTimeout(openGift, 1400);
}

// ===== Fireworks (used on the final page) =====
function launchFireworks() {
  const colors = ['#ff7eb6', '#ffd76e', '#ffffff', '#ff4d94'];
  for (let burst = 0; burst < 5; burst++) {
    setTimeout(() => {
      const cx = 20 + Math.random() * 60;
      const cy = 20 + Math.random() * 40;
      for (let p = 0; p < 22; p++) {
        const f = document.createElement('div');
        f.className = 'fw';
        const angle = (p / 22) * Math.PI * 2;
        const dist = 60 + Math.random() * 60;
        f.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        f.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        f.style.left = cx + 'vw';
        f.style.top = cy + 'vh';
        f.style.background = colors[Math.floor(Math.random() * colors.length)];
        f.style.boxShadow = '0 0 6px 2px ' + f.style.background;
        document.body.appendChild(f);
        setTimeout(() => f.remove(), 1500);
      }
    }, burst * 450);
  }
}
