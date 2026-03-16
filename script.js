/* ============================================================
   ABISHKAR KAFLE — portfolio animations
   ============================================================ */

/* ── 1. SCROLL PROGRESS RING + nav scrolled state ── */
const navEl        = document.querySelector('nav');
const progressRing = document.getElementById('nav-progress-ring');
const progressFill = document.getElementById('nav-progress-fill');
const progressTrack= document.getElementById('nav-progress-track');

let perimeter = 0;

function syncRing() {
  if (!navEl || !progressRing || !progressFill || !progressTrack) return;

  const w  = navEl.offsetWidth;
  const h  = navEl.offsetHeight;
  // border-radius is 100px but clamped to half the shortest side (pill)
  const r  = Math.min(100, h / 2);
  const sw = 2.5; // stroke-width of fill
  const pad = sw / 2 + 0.5; // inset so stroke sits on the edge

  // Position SVG exactly over nav
  progressRing.setAttribute('viewBox', `0 0 ${w} ${h}`);
  progressRing.style.width  = w + 'px';
  progressRing.style.height = h + 'px';

  // Set rect geometry — inset by half stroke-width so stroke doesn't clip
  [progressTrack, progressFill].forEach(rect => {
    rect.setAttribute('x',      pad);
    rect.setAttribute('y',      pad);
    rect.setAttribute('width',  w - pad * 2);
    rect.setAttribute('height', h - pad * 2);
    rect.setAttribute('rx',     r - pad);
    rect.setAttribute('ry',     r - pad);
  });

  // Perimeter of rounded rect: 2*(straight sides) + circumference of full circle
  const straightW = w - pad * 2 - 2 * (r - pad);
  const straightH = h - pad * 2 - 2 * (r - pad);
  perimeter = 2 * (straightW + straightH) + 2 * Math.PI * (r - pad);

  // Keep fill in sync with current scroll
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) || 0;
  progressFill.style.strokeDasharray = (pct * perimeter) + ' ' + perimeter;
}

// Run once after layout, then on resize
requestAnimationFrame(syncRing);
window.addEventListener('resize', syncRing);

window.addEventListener('scroll', () => {
  const pct = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight), 1);
  if (progressFill) {
    progressFill.style.strokeDasharray = (pct * perimeter) + ' ' + perimeter;
  }
  if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── 2. HERO NETWORK CANVAS ── */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NODE_COUNT = 28;
  const LINK_DIST  = 160;
  const COLOR_NODE = 'rgba(28,79,138,0.55)';
  const COLOR_LINE = 'rgba(28,79,138,0.12)';
  const COLOR_PULSE= 'rgba(200,135,58,0.7)';

  // Nodes
  const nodes = Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2.5 + 1.5,
  }));

  // Pulse packets that travel along edges
  const packets = [];
  let lastPacket = 0;

  function spawnPacket() {
    const a = Math.floor(Math.random() * nodes.length);
    let b;
    do { b = Math.floor(Math.random() * nodes.length); } while (b === a);
    const dx = nodes[b].x - nodes[a].x;
    const dy = nodes[b].y - nodes[a].y;
    if (Math.hypot(dx, dy) < LINK_DIST) {
      packets.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.006 });
    }
  }

  function draw(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move nodes
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = COLOR_LINE;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_NODE;
      ctx.fill();
    });

    // Spawn packets every ~1.2s
    if (ts - lastPacket > 1200) { spawnPacket(); lastPacket = ts; }

    // Draw + move packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.speed;
      if (p.t >= 1) { packets.splice(i, 1); continue; }
      const na = nodes[p.a], nb = nodes[p.b];
      const px = na.x + (nb.x - na.x) * p.t;
      const py = na.y + (nb.y - na.y) * p.t;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_PULSE;
      ctx.fill();
      // Glow
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,135,58,0.15)';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ── 3. TYPEWRITER ── */
(function () {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = [
    'IT Support Specialist',
    'CCNA Candidate',
    'Future ISP Engineer',
    'Network Enthusiast',
    'Aspiring CITO',
  ];
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
      setTimeout(tick, 65);
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 400); return; }
      setTimeout(tick, 35);
    }
  }
  setTimeout(tick, 800);
})();

/* ── 4. COUNTER ANIMATION (stat cards with data-count) ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  if (isNaN(target)) return;
  const duration = 1200;
  const start = performance.now();
  function step(now) {
    const pct = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - pct, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (pct < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── 5. SCROLL REVEAL + staggered children ── */
if ('IntersectionObserver' in window) {
  document.body.classList.add('js-reveal-ready');

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');

      // Stagger direct children that have .stagger class
      el.querySelectorAll('.stagger').forEach((child, i) => {
        child.style.transitionDelay = (i * 80) + 'ms';
        child.classList.add('visible');
      });

      // Bar animations
      el.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = (parseFloat(bar.dataset.width) * 100) + '%';
        bar.classList.add('animated');
      });

      // Counter animations
      el.querySelectorAll('[data-count]').forEach(animateCounter);

      revealObs.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

} else {
  document.querySelectorAll('.reveal, .stagger').forEach(el => el.classList.add('visible'));
  document.querySelectorAll('.bar-fill').forEach(bar => {
    bar.style.width = (parseFloat(bar.dataset.width) * 100) + '%';
    bar.classList.add('animated');
  });
  document.querySelectorAll('[data-count]').forEach(animateCounter);
}

// Init bar widths collapsed
document.querySelectorAll('.bar-fill').forEach(bar => {
  bar.style.width = (parseFloat(bar.dataset.width) * 100) + '%';
  bar.style.transform = 'scaleX(0)';
});

/* ── 6. ACTIVE NAV LINK on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionObs.observe(s));

/* ── 7. HERO CARD tilt on mouse ── */
const heroCard = document.querySelector('.hero-card');
if (heroCard) {
  heroCard.addEventListener('mousemove', e => {
    const r = heroCard.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    heroCard.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  });
  heroCard.addEventListener('mouseleave', () => {
    heroCard.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
  });
}
