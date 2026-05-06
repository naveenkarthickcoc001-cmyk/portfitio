/* ═══════════════════════════════════════════════════
   Portfolio JS – G. Naveen Karthick
   Smart DB: MongoDB API → localStorage fallback
   ═══════════════════════════════════════════════════ */

// ─── API Base URL ──────────────────────────────────
const API_BASE = window.location.origin + '/api';
let serverAvailable = null; // null = not checked, true/false after check

// ─── Check if backend server is reachable ──────────
async function checkServer() {
  if (serverAvailable !== null) return serverAvailable;
  try {
    const res = await fetch(API_BASE + '/projects', { method: 'GET', signal: AbortSignal.timeout(3000) });
    serverAvailable = res.ok;
  } catch {
    serverAvailable = false;
  }
  console.log(serverAvailable ? '🟢 Connected to MongoDB API' : '🟡 API offline — using localStorage');
  return serverAvailable;
}

// ─── Data Layer (MongoDB API + localStorage fallback) ─
const DB = {
  // ── localStorage helpers ──
  _localGet(key) {
    try { return JSON.parse(localStorage.getItem('nk_' + key)) || []; }
    catch { return []; }
  },
  _localSet(key, val) { localStorage.setItem('nk_' + key, JSON.stringify(val)); },
  _localAdd(key, item) {
    const arr = this._localGet(key);
    item.id = Date.now().toString();
    item._id = item.id; // Consistent with MongoDB _id field
    arr.push(item);
    this._localSet(key, arr);
    return item;
  },
  _localRemove(key, id) {
    this._localSet(key, this._localGet(key).filter(i => (i._id || i.id) !== id));
  },

  // ── API key mapping (URL path ↔ localStorage key) ──
  _storageKey(collection) {
    const map = { 'projects': 'projects', 'websites': 'websites', 'achievements': 'achievements', 'about-extras': 'about_extras', 'messages': 'messages' };
    return map[collection] || collection;
  },

  // ── Smart CRUD methods ──
  async getAll(collection) {
    const online = await checkServer();
    if (online) {
      try {
        const res = await fetch(`${API_BASE}/${collection}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        // Sync to localStorage as cache
        this._localSet(this._storageKey(collection), data);
        return data;
      } catch (err) {
        console.warn(`API fetch failed for ${collection}, using cache`);
        return this._localGet(this._storageKey(collection));
      }
    }
    return this._localGet(this._storageKey(collection));
  },

  async add(collection, item) {
    const online = await checkServer();
    if (online) {
      try {
        const res = await fetch(`${API_BASE}/${collection}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        if (!res.ok) throw new Error('API error');
        const saved = await res.json();
        return saved;
      } catch (err) {
        console.warn(`API add failed for ${collection}, saving locally`);
        return this._localAdd(this._storageKey(collection), item);
      }
    }
    return this._localAdd(this._storageKey(collection), item);
  },

  async remove(collection, id) {
    const online = await checkServer();
    if (online) {
      try {
        const res = await fetch(`${API_BASE}/${collection}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('API error');
        return true;
      } catch (err) {
        console.warn(`API delete failed for ${collection}, removing locally`);
        this._localRemove(this._storageKey(collection), id);
        return true;
      }
    }
    this._localRemove(this._storageKey(collection), id);
    return true;
  }
};

// ─── Seed default data (localStorage only, runs once) ─
(function seedDefaults() {
  if (localStorage.getItem('nk_seeded')) return;
  DB._localSet('projects', [
    { _id: '1', id: '1', title: 'AU Mate', desc: 'A campus social networking app built with React, featuring glassmorphism UI and multi-step onboarding.', tags: 'React,Node.js,CSS', github: 'https://github.com/naveenkarthick/au-mate', live: '' },
    { _id: '2', id: '2', title: 'Doctor Appointment System', desc: 'Full-stack cloud-based appointment system with role-based modules for patients, doctors, and admins.', tags: 'Node.js,MySQL,Express,HTML', github: 'https://github.com/naveenkarthick/doctor-app', live: '' },
    { _id: '3', id: '3', title: 'Portfolio Website', desc: 'This very portfolio – dynamic, animated, and fully responsive personal showcase.', tags: 'HTML,CSS,JavaScript', github: '', live: '#' }
  ]);
  DB._localSet('websites', [
    { _id: '4', id: '4', title: 'Personal Blog', desc: 'A clean blog platform sharing tech articles and tutorials.', url: 'https://blog.example.com', icon: '📝' },
    { _id: '5', id: '5', title: 'Dev Tools Hub', desc: 'A collection of handy developer utilities and converters.', url: 'https://devtools.example.com', icon: '🛠️' }
  ]);
  DB._localSet('achievements', [
    { _id: '6', id: '6', title: 'Started B.E. in CSE', desc: 'Joined Jayaraj Annapackiam CSI College of Engineering.', date: '2024' },
    { _id: '7', id: '7', title: 'Built First Full-Stack App', desc: 'Completed the Doctor Appointment System project with cloud deployment.', date: '2025' },
    { _id: '8', id: '8', title: 'Campus Social App – AU Mate', desc: 'Designed and developed a social networking app for university students.', date: '2026' }
  ]);
  DB._localSet('about_extras', []);
  localStorage.setItem('nk_seeded', '1');
})();

// ─── Forest Particle Canvas (Glowing Spores + Light) ─
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 50; i++) {
    const isGlow = Math.random() > 0.6;
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: -Math.random() * 0.3 - 0.05,
      r: isGlow ? Math.random() * 3 + 1.5 : Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      glow: isGlow,
      pulse: Math.random() * Math.PI * 2,
      color: isGlow ? [255, 224, 130] : [124, 207, 78]
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx + Math.sin(p.pulse) * 0.15;
      p.y += p.vy;
      p.pulse += 0.015;
      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.glow) {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${a * 0.6})`);
        grad.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(p.x - p.r * 4, p.y - p.r * 4, p.r * 8, p.r * 8);
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── Navigation ────────────────────────────────────
let currentPage = 'home';

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(page);
  if (section) { section.classList.add('active'); section.style.animation = 'none'; section.offsetHeight; section.style.animation = ''; }

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  // Close mobile menu
  document.getElementById('navLinks').classList.remove('open');
  document.getElementById('hamburger').classList.remove('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderPage(page);
  updateStats();
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('active');
}

// ─── Navbar scroll effect ──────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

// ─── Render Functions ──────────────────────────────
function renderPage(page) {
  if (page === 'projects') renderProjects();
  if (page === 'websites') renderWebsites();
  if (page === 'achievements') renderAchievements();
  if (page === 'about') renderAboutExtras();
}

async function renderProjects() {
  const grid = document.getElementById('projects-grid');
  const items = await DB.getAll('projects');
  grid.innerHTML = items.map(p => `
    <div class="card reveal">
      <div class="card-icon">🚀</div>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.desc)}</p>
      <div class="card-tags">${(p.tags || '').split(',').filter(Boolean).map(t => `<span class="tag">${esc(t.trim())}</span>`).join('')}</div>
      <div class="card-links">
        ${p.github ? `<a class="card-link" href="${esc(p.github)}" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}
        ${p.live ? `<a class="card-link" href="${esc(p.live)}" target="_blank"><i class="fas fa-external-link-alt"></i> Live</a>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn btn-outline btn-sm btn-danger" onclick="deleteItem('projects','${p._id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
  animateReveal();
}

async function renderWebsites() {
  const grid = document.getElementById('websites-grid');
  const items = await DB.getAll('websites');
  grid.innerHTML = items.map(w => `
    <div class="card reveal">
      <div class="card-icon">${w.icon || '🌐'}</div>
      <h3>${esc(w.title)}</h3>
      <p>${esc(w.desc)}</p>
      <div class="card-links">
        ${w.url ? `<a class="card-link" href="${esc(w.url)}" target="_blank"><i class="fas fa-external-link-alt"></i> Visit Site</a>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn btn-outline btn-sm btn-danger" onclick="deleteItem('websites','${w._id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
  animateReveal();
}

async function renderAchievements() {
  const tl = document.getElementById('achievements-timeline');
  const items = await DB.getAll('achievements');
  tl.innerHTML = items.map(a => `
    <div class="timeline-item reveal">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-date">${esc(a.date)}</div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.desc)}</p>
        <div class="card-actions">
          <button class="btn btn-outline btn-sm btn-danger" onclick="deleteItem('achievements','${a._id}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
  animateReveal();
}

async function renderAboutExtras() {
  const wrap = document.getElementById('extra-about-details');
  const items = await DB.getAll('about-extras');
  if (!items.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `<ul class="about-details">${items.map(i => `
    <li>
      <span class="label">${esc(i.label)}</span>
      <span class="value">${esc(i.value)}</span>
      <button class="btn btn-outline btn-sm btn-danger" style="margin-left:auto;padding:4px 10px;" onclick="deleteItem('about-extras','${i._id}')"><i class="fas fa-trash"></i></button>
    </li>
  `).join('')}</ul>`;
}

async function updateStats() {
  const [projects, websites, achievements] = await Promise.all([
    DB.getAll('projects'),
    DB.getAll('websites'),
    DB.getAll('achievements')
  ]);
  animateCounter('stat-projects', projects.length);
  animateCounter('stat-websites', websites.length);
  animateCounter('stat-achievements', achievements.length);
}

function animateCounter(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 30);
}

// ─── Scroll Reveal Animation ───────────────────────
function animateReveal() {
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 100);
    });
  }, 50);
}

// ─── Modal System ──────────────────────────────────
function openModal(type) {
  const overlay = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  const footer = document.getElementById('modalFooter');

  if (type === 'project') {
    title.textContent = 'Add New Project';
    body.innerHTML = `
      <div class="form-group"><label>Project Title</label><input id="m-title" placeholder="My Awesome Project" /></div>
      <div class="form-group"><label>Description</label><textarea id="m-desc" rows="3" placeholder="What does it do?"></textarea></div>
      <div class="form-group"><label>Tags (comma-separated)</label><input id="m-tags" placeholder="React, Node.js, CSS" /></div>
      <div class="form-group"><label>GitHub URL</label><input id="m-github" placeholder="https://github.com/..." /></div>
      <div class="form-group"><label>Live Demo URL</label><input id="m-live" placeholder="https://..." /></div>
    `;
    footer.innerHTML = `<button class="btn btn-outline btn-sm" onclick="closeModal()">Cancel</button><button class="btn btn-primary btn-sm" onclick="saveProject()">Save</button>`;
  } else if (type === 'website') {
    title.textContent = 'Add New Website';
    body.innerHTML = `
      <div class="form-group"><label>Website Name</label><input id="m-title" placeholder="My Blog" /></div>
      <div class="form-group"><label>Description</label><textarea id="m-desc" rows="3" placeholder="What is this site about?"></textarea></div>
      <div class="form-group"><label>URL</label><input id="m-url" placeholder="https://..." /></div>
      <div class="form-group"><label>Icon Emoji</label><input id="m-icon" placeholder="🌐" maxlength="4" /></div>
    `;
    footer.innerHTML = `<button class="btn btn-outline btn-sm" onclick="closeModal()">Cancel</button><button class="btn btn-primary btn-sm" onclick="saveWebsite()">Save</button>`;
  } else if (type === 'achievement') {
    title.textContent = 'Add Achievement';
    body.innerHTML = `
      <div class="form-group"><label>Title</label><input id="m-title" placeholder="Won a Hackathon" /></div>
      <div class="form-group"><label>Description</label><textarea id="m-desc" rows="3" placeholder="Details about the achievement"></textarea></div>
      <div class="form-group"><label>Date / Year</label><input id="m-date" placeholder="2026" /></div>
    `;
    footer.innerHTML = `<button class="btn btn-outline btn-sm" onclick="closeModal()">Cancel</button><button class="btn btn-primary btn-sm" onclick="saveAchievement()">Save</button>`;
  } else if (type === 'about') {
    title.textContent = 'Add About Detail';
    body.innerHTML = `
      <div class="form-group"><label>Label (e.g. 🎯 Hobby)</label><input id="m-label" placeholder="🎯 Hobby" /></div>
      <div class="form-group"><label>Value</label><input id="m-value" placeholder="Playing chess, coding..." /></div>
    `;
    footer.innerHTML = `<button class="btn btn-outline btn-sm" onclick="closeModal()">Cancel</button><button class="btn btn-primary btn-sm" onclick="saveAbout()">Save</button>`;
  }
  overlay.classList.add('active');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }
function closeModalOutside(e) { if (e.target === e.currentTarget) closeModal(); }

// ─── Save Handlers ─────────────────────────────────
async function saveProject() {
  const title = document.getElementById('m-title').value.trim();
  const desc = document.getElementById('m-desc').value.trim();
  if (!title) { showToast('Please enter a title', 'error'); return; }
  const result = await DB.add('projects', {
    title, desc,
    tags: document.getElementById('m-tags').value.trim(),
    github: document.getElementById('m-github').value.trim(),
    live: document.getElementById('m-live').value.trim()
  });
  if (result) {
    closeModal(); renderProjects(); updateStats(); showToast('Project added!', 'success');
  } else {
    showToast('Failed to save project', 'error');
  }
}

async function saveWebsite() {
  const title = document.getElementById('m-title').value.trim();
  const desc = document.getElementById('m-desc').value.trim();
  if (!title) { showToast('Please enter a name', 'error'); return; }
  const result = await DB.add('websites', {
    title, desc,
    url: document.getElementById('m-url').value.trim(),
    icon: document.getElementById('m-icon').value.trim() || '🌐'
  });
  if (result) {
    closeModal(); renderWebsites(); updateStats(); showToast('Website added!', 'success');
  } else {
    showToast('Failed to save website', 'error');
  }
}

async function saveAchievement() {
  const title = document.getElementById('m-title').value.trim();
  if (!title) { showToast('Please enter a title', 'error'); return; }
  const result = await DB.add('achievements', {
    title,
    desc: document.getElementById('m-desc').value.trim(),
    date: document.getElementById('m-date').value.trim()
  });
  if (result) {
    closeModal(); renderAchievements(); updateStats(); showToast('Achievement added!', 'success');
  } else {
    showToast('Failed to save achievement', 'error');
  }
}

async function saveAbout() {
  const label = document.getElementById('m-label').value.trim();
  const value = document.getElementById('m-value').value.trim();
  if (!label || !value) { showToast('Fill in both fields', 'error'); return; }
  const result = await DB.add('about-extras', { label, value });
  if (result) {
    closeModal(); renderAboutExtras(); showToast('Detail added!', 'success');
  } else {
    showToast('Failed to save detail', 'error');
  }
}

async function deleteItem(collection, id) {
  if (!confirm('Delete this item?')) return;
  const success = await DB.remove(collection, id);
  if (success) {
    renderPage(currentPage); updateStats(); showToast('Deleted', 'success');
  } else {
    showToast('Failed to delete', 'error');
  }
}

// ─── Contact Form ──────────────────────────────────
async function handleContact(e) {
  e.preventDefault();
  const name = document.getElementById('c-name').value;
  const email = document.getElementById('c-email').value;
  const msg = document.getElementById('c-msg').value;
  const result = await DB.add('messages', { name, email, msg });
  if (result) {
    e.target.reset();
    showToast('Message sent! Thank you, ' + name + ' 🎉', 'success');
  } else {
    showToast('Failed to send message', 'error');
  }
}

// ─── Toast ─────────────────────────────────────────
function showToast(text, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.className = 'toast ' + type + ' show';
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Helpers ───────────────────────────────────────
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ─── Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
});
