// ===== Starfield + Moon =====
const starsLayer = document.getElementById('stars');
if(starsLayer){
  for(let i=0;i<120;i++){
    const s = document.createElement('div');
    s.className='star';
    const size = Math.random()*2.4+0.6;
    s.style.width = size+'px';
    s.style.height = size+'px';
    s.style.top = Math.random()*100+'%';
    s.style.left = Math.random()*100+'%';
    s.style.animationDuration = (1.5+Math.random()*3)+'s';
    s.style.animationDelay = Math.random()*3+'s';
    starsLayer.appendChild(s);
  }
  const moon = document.createElement('div');
  moon.className='moon';
  starsLayer.appendChild(moon);
}

// ===== Floating hearts =====
function spawnHeart(){
  const h = document.createElement('div');
  h.className='float-heart';
  h.textContent = ['♥','❤','💕'][Math.floor(Math.random()*3)];
  h.style.left = Math.random()*100+'vw';
  h.style.bottom='-20px';
  const dur = 7+Math.random()*6;
  h.style.animationDuration = dur+'s';
  h.style.fontSize = (12+Math.random()*14)+'px';
  document.body.appendChild(h);
  setTimeout(()=>h.remove(), dur*1000);
}
setInterval(spawnHeart, 900);
for(let i=0;i<4;i++) setTimeout(spawnHeart, i*300);

// ===== Butterflies =====
function spawnButterfly(){
  const b = document.createElement('div');
  b.className='butterfly';
  b.textContent='🦋';
  b.style.left = (10+Math.random()*80)+'vw';
  b.style.top = (15+Math.random()*60)+'vh';
  b.style.animationDuration = (3+Math.random()*2)+'s';
  document.body.appendChild(b);
  setTimeout(()=>b.remove(), 6000);
}
setInterval(spawnButterfly, 2500);

// ===== Click-to-continue on story pages =====
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundMusic();
  initFinalSurprise();
  const body = document.body;
  const nextPage = body.dataset.nextPage;

  if (!nextPage) return;

  body.addEventListener('click', (event) => {
    const clickedLink = event.target.closest('a');
    if (clickedLink || event.target.closest('.navRow')) return;
    window.location.href = nextPage;
  });
});

function initBackgroundMusic(){
  const audio = document.getElementById('bgMusic');
  if (!audio) return;

  const storageKey = 'ourStoryBgMusicTime';
  const savedTime = parseFloat(localStorage.getItem(storageKey));
  if (!Number.isNaN(savedTime) && savedTime > 0) {
    audio.currentTime = savedTime;
  }

  const saveTime = () => {
    if (!audio.paused && !audio.seeking) {
      localStorage.setItem(storageKey, audio.currentTime.toString());
    }
  };

  const tryPlay = () => {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const onFirstInteraction = () => {
          audio.play().catch(() => {});
          window.removeEventListener('click', onFirstInteraction);
          window.removeEventListener('keydown', onFirstInteraction);
        };
        window.addEventListener('click', onFirstInteraction);
        window.addEventListener('keydown', onFirstInteraction);
      });
    }
  };

  audio.volume = 0.45;
  tryPlay();

  const intervalId = setInterval(saveTime, 500);
  window.addEventListener('beforeunload', saveTime);
  window.addEventListener('pagehide', () => {
    saveTime();
    clearInterval(intervalId);
  });
}

// ===== Final surprise box =====
function initFinalSurprise(){
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
function launchFireworks(){
  const colors = ['#ff7eb6','#ffd76e','#ffffff','#ff4d94'];
  for(let burst=0; burst<5; burst++){
    setTimeout(()=>{
      const cx = 20+Math.random()*60;
      const cy = 20+Math.random()*40;
      for(let p=0;p<22;p++){
        const f = document.createElement('div');
        f.className='fw';
        const angle = (p/22)*Math.PI*2;
        const dist = 60+Math.random()*60;
        f.style.setProperty('--dx', Math.cos(angle)*dist+'px');
        f.style.setProperty('--dy', Math.sin(angle)*dist+'px');
        f.style.left = cx+'vw';
        f.style.top = cy+'vh';
        f.style.background = colors[Math.floor(Math.random()*colors.length)];
        f.style.boxShadow = '0 0 6px 2px '+f.style.background;
        document.body.appendChild(f);
        setTimeout(()=>f.remove(), 1500);
      }
    }, burst*450);
  }
}
