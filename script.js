/* ═══════════════════════════════════════════════════
   Portfolio JS – G. Naveen Karthick
   Backend: Supabase (PostgreSQL) – no server needed!
   ═══════════════════════════════════════════════════ */

// ── Supabase Config ────────────────────────────────
const SUPABASE_URL = 'https://nqrqzrygayvkvgtprlij.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcnF6cnlnYXl2a3ZndHBybGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTIyNzAsImV4cCI6MjA5OTUyODI3MH0.sn2IaC7b42GltB8VoqDAFRP1cax-kiqGcE46dEmMvBs';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON,
  'Authorization': 'Bearer ' + SUPABASE_ANON,
  'Prefer': 'return=representation'
};

// ── Supabase REST helpers ──────────────────────────
const SB = {
  url: (table, query = '') => `${SUPABASE_URL}/rest/v1/${table}${query}`,

  async getAll(table) {
    try {
      const res = await fetch(SB.url(table, '?order=created_at.asc'), { headers });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (e) {
      console.warn('Supabase getAll error:', e.message);
      return _localGet(table);
    }
  },

  async add(table, data) {
    try {
      const res = await fetch(SB.url(table), {
        method: 'POST', headers,
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      return rows[0] || rows;
    } catch (e) {
      console.warn('Supabase add error:', e.message);
      return _localAdd(table, data);
    }
  },

  async remove(table, id) {
    try {
      const res = await fetch(SB.url(table, `?id=eq.${id}`), {
        method: 'DELETE',
        headers: { ...headers, 'Prefer': 'return=minimal' }
      });
      // 204 No Content is a valid success for DELETE
      if (res.status === 204 || res.ok) {
        _localRemove(table, id); // also remove from local cache
        return true;
      }
      const errText = await res.text();
      console.error(`Supabase DELETE error [${res.status}]:`, errText);
      throw new Error(errText);
    } catch (e) {
      console.error('Supabase remove failed, using local fallback:', e.message);
      _localRemove(table, id);
      return true;
    }
  }
};

// ── localStorage fallback ──────────────────────────
function _localGet(k) { try { return JSON.parse(localStorage.getItem('nk_' + k)) || []; } catch { return []; } }
function _localSet(k, v) { localStorage.setItem('nk_' + k, JSON.stringify(v)); }
function _localAdd(k, item) { const a = _localGet(k); item.id = Date.now().toString(); a.push(item); _localSet(k, a); return item; }
function _localRemove(k, id) { _localSet(k, _localGet(k).filter(i => i.id !== id)); }

// ── Particles ─────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 50; i++) {
    const g = Math.random() > 0.6;
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .2, vy: -Math.random() * .3 - .05,
      r: g ? Math.random() * 3 + 1.5 : Math.random() * 1.5 + .5,
      alpha: Math.random() * .4 + .1, glow: g,
      pulse: Math.random() * Math.PI * 2,
      color: g ? [255, 224, 130] : [124, 207, 78]
    });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx + Math.sin(p.pulse) * .15; p.y += p.vy; p.pulse += .015;
      const a = p.alpha * (.6 + .4 * Math.sin(p.pulse));
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.glow) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(${p.color},${a * .6})`); g.addColorStop(1, `rgba(${p.color},0)`);
        ctx.fillStyle = g; ctx.fillRect(p.x - p.r * 4, p.y - p.r * 4, p.r * 8, p.r * 8);
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Navigation ─────────────────────────────────────
let currentPage = 'home';
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById(page);
  if (sec) { sec.classList.add('active'); sec.style.animation = 'none'; sec.offsetHeight; sec.style.animation = ''; }
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
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
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

// ── Render ─────────────────────────────────────────
function renderPage(p) {
  if (p === 'projects') renderProjects();
  if (p === 'websites') renderWebsites();
  if (p === 'achievements') renderAchievements();
  if (p === 'about') renderAboutExtras();
}

async function renderProjects() {
  const grid = document.getElementById('projects-grid');
  const items = await SB.getAll('projects');
  grid.innerHTML = items.map(p => `
    <div class="card reveal">
      <div class="card-icon">🚀</div>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.description)}</p>
      <div class="card-tags">${(p.tags || '').split(',').filter(Boolean).map(t => `<span class="tag">${esc(t.trim())}</span>`).join('')}</div>
      <div class="card-links">
        ${p.github_url ? `<a class="card-link" href="${esc(p.github_url)}" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}
        ${p.live_url ? `<a class="card-link" href="${esc(p.live_url)}"   target="_blank"><i class="fas fa-external-link-alt"></i> Live</a>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn btn-outline btn-sm btn-danger" onclick="deleteItem('projects','${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
  animateReveal();
}

async function renderWebsites() {
  const grid = document.getElementById('websites-grid');
  const items = await SB.getAll('websites');
  grid.innerHTML = items.map(w => `
    <div class="card reveal">
      <div class="card-icon">${w.icon || '🌐'}</div>
      <h3>${esc(w.title)}</h3>
      <p>${esc(w.description)}</p>
      <div class="card-links">
        ${w.url ? `<a class="card-link" href="${esc(w.url)}" target="_blank"><i class="fas fa-external-link-alt"></i> Visit Site</a>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn btn-outline btn-sm btn-danger" onclick="deleteItem('websites','${w.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
  animateReveal();
}

async function renderAchievements() {
  const tl = document.getElementById('achievements-timeline');
  const items = await SB.getAll('achievements');
  tl.innerHTML = items.map(a => `
    <div class="timeline-item reveal">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-date">${esc(a.year)}</div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.description)}</p>
        <div class="card-actions">
          <button class="btn btn-outline btn-sm btn-danger" onclick="deleteItem('achievements','${a.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>`).join('');
  animateReveal();
}

async function renderAboutExtras() {
  const wrap = document.getElementById('extra-about-details');
  const items = await SB.getAll('about_extras');
  if (!items.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `<ul class="about-details">${items.map(i => `
    <li>
      <span class="label">${esc(i.label)}</span>
      <span class="value">${esc(i.value)}</span>
      <button class="btn btn-outline btn-sm btn-danger" style="margin-left:auto;padding:4px 10px;" onclick="deleteItem('about_extras','${i.id}')"><i class="fas fa-trash"></i></button>
    </li>`).join('')}</ul>`;
}

async function updateStats() {
  const [p, w, a] = await Promise.all([
    SB.getAll('projects'), SB.getAll('websites'), SB.getAll('achievements')
  ]);
  animateCounter('stat-projects', p.length);
  animateCounter('stat-websites', w.length);
  animateCounter('stat-achievements', a.length);
}

function animateCounter(id, target) {
  const el = document.getElementById(id); if (!el) return;
  let cur = 0; const step = Math.max(1, Math.ceil(target / 30));
  const t = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(t); } el.textContent = cur; }, 30);
}

function animateReveal() {
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 100));
  }, 50);
}

// ── Modal ──────────────────────────────────────────
function openModal(type) {
  const ov = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  const foot = document.getElementById('modalFooter');
  if (type === 'project') {
    title.textContent = 'Add New Project';
    body.innerHTML = `
      <div class="form-group"><label>Project Title</label><input id="m-title" placeholder="My Awesome Project"/></div>
      <div class="form-group"><label>Description</label><textarea id="m-desc" rows="3" placeholder="What does it do?"></textarea></div>
      <div class="form-group"><label>Tags (comma-separated)</label><input id="m-tags" placeholder="React, Node.js, CSS"/></div>
      <div class="form-group"><label>GitHub URL</label><input id="m-github" placeholder="https://github.com/..."/></div>
      <div class="form-group"><label>Live Demo URL</label><input id="m-live" placeholder="https://..."/></div>`;
    foot.innerHTML = `<button class="btn btn-outline btn-sm" onclick="closeModal()">Cancel</button><button class="btn btn-primary btn-sm" onclick="saveProject()">Save</button>`;
  } else if (type === 'website') {
    title.textContent = 'Add New Website';
    body.innerHTML = `
      <div class="form-group"><label>Website Name</label><input id="m-title" placeholder="My Blog"/></div>
      <div class="form-group"><label>Description</label><textarea id="m-desc" rows="3"></textarea></div>
      <div class="form-group"><label>URL</label><input id="m-url" placeholder="https://..."/></div>
      <div class="form-group"><label>Icon Emoji</label><input id="m-icon" placeholder="🌐" maxlength="4"/></div>`;
    foot.innerHTML = `<button class="btn btn-outline btn-sm" onclick="closeModal()">Cancel</button><button class="btn btn-primary btn-sm" onclick="saveWebsite()">Save</button>`;
  } else if (type === 'achievement') {
    title.textContent = 'Add Achievement';
    body.innerHTML = `
      <div class="form-group"><label>Title</label><input id="m-title" placeholder="Won a Hackathon"/></div>
      <div class="form-group"><label>Description</label><textarea id="m-desc" rows="3"></textarea></div>
      <div class="form-group"><label>Year</label><input id="m-date" placeholder="2026"/></div>`;
    foot.innerHTML = `<button class="btn btn-outline btn-sm" onclick="closeModal()">Cancel</button><button class="btn btn-primary btn-sm" onclick="saveAchievement()">Save</button>`;
  } else if (type === 'about') {
    title.textContent = 'Add About Detail';
    body.innerHTML = `
      <div class="form-group"><label>Label (e.g. 🎯 Hobby)</label><input id="m-label" placeholder="🎯 Hobby"/></div>
      <div class="form-group"><label>Value</label><input id="m-value" placeholder="Playing chess, coding..."/></div>`;
    foot.innerHTML = `<button class="btn btn-outline btn-sm" onclick="closeModal()">Cancel</button><button class="btn btn-primary btn-sm" onclick="saveAbout()">Save</button>`;
  }
  ov.classList.add('active');
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }
function closeModalOutside(e) { if (e.target === e.currentTarget) closeModal(); }

// ── Save Handlers ──────────────────────────────────
async function saveProject() {
  const title = document.getElementById('m-title').value.trim();
  if (!title) { showToast('Please enter a title', 'error'); return; }
  const r = await SB.add('projects', {
    title, description: document.getElementById('m-desc').value.trim(),
    tags: document.getElementById('m-tags').value.trim(),
    github_url: document.getElementById('m-github').value.trim(),
    live_url: document.getElementById('m-live').value.trim()
  });
  if (r) { closeModal(); renderProjects(); updateStats(); showToast('Project added! 🚀', 'success'); }
  else showToast('Failed to save', 'error');
}

async function saveWebsite() {
  const title = document.getElementById('m-title').value.trim();
  if (!title) { showToast('Please enter a name', 'error'); return; }
  const r = await SB.add('websites', {
    title, description: document.getElementById('m-desc').value.trim(),
    url: document.getElementById('m-url').value.trim(),
    icon: document.getElementById('m-icon').value.trim() || '🌐'
  });
  if (r) { closeModal(); renderWebsites(); updateStats(); showToast('Website added! 🌐', 'success'); }
  else showToast('Failed to save', 'error');
}

async function saveAchievement() {
  const title = document.getElementById('m-title').value.trim();
  if (!title) { showToast('Please enter a title', 'error'); return; }
  const r = await SB.add('achievements', {
    title, description: document.getElementById('m-desc').value.trim(),
    year: document.getElementById('m-date').value.trim()
  });
  if (r) { closeModal(); renderAchievements(); updateStats(); showToast('Achievement added! 🏆', 'success'); }
  else showToast('Failed to save', 'error');
}

async function saveAbout() {
  const label = document.getElementById('m-label').value.trim();
  const value = document.getElementById('m-value').value.trim();
  if (!label || !value) { showToast('Fill in both fields', 'error'); return; }
  const r = await SB.add('about_extras', { label, value });
  if (r) { closeModal(); renderAboutExtras(); showToast('Detail added!', 'success'); }
  else showToast('Failed to save', 'error');
}

async function deleteItem(table, id) {
  if (!confirm('Delete this item?')) return;
  try {
    await SB.remove(table, id);
    renderPage(currentPage);
    updateStats();
    showToast('Deleted ✓', 'success');
  } catch (e) {
    console.error('deleteItem error:', e);
    showToast('Failed to delete', 'error');
  }
}

// ── Contact Form ───────────────────────────────────
async function handleContact(e) {
  e.preventDefault();
  const name = document.getElementById('c-name').value;
  const email = document.getElementById('c-email').value;
  const message = document.getElementById('c-msg').value;
  const r = await SB.add('messages', { name, email, message });
  if (r) { e.target.reset(); showToast(`Message sent! Thank you ${name} 🎉`, 'success'); }
  else showToast('Failed to send message', 'error');
}

// ── Toast ──────────────────────────────────────────
function showToast(text, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = text; t.className = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Helper ─────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
}

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', updateStats);
