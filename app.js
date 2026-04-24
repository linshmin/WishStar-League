/* ============================================================
   WishStar League - 團隊夥伴平台  |  app.js
   ============================================================ */

// ============ STARFIELD BACKGROUND ============
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  function createStars() {
    stars = [];
    const colors = ['20,184,166','249,115,22','16,185,129'];
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.008 + 0.003,
        phase: Math.random() * Math.PI * 2,
        color: colors[i % 3]
      });
    }
  }
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.016;
    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color},${a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  resize();
  createStars();
  draw();
  window.addEventListener('resize', () => { resize(); createStars(); });
})();

// ============ DATA LAYER (localStorage) ============
const STORAGE_KEYS = {
  users: 'wsl_users',
  articles: 'wsl_articles',
  worklogs: 'wsl_worklogs',
  teams: 'wsl_teams',
  session: 'wsl_session'
};

function loadData(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
}
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ============ INIT DEFAULT DATA ============
function initDefaults() {
  // Teams
  if (!loadData(STORAGE_KEYS.teams)) {
    saveData(STORAGE_KEYS.teams, [
      '文玲團隊','玫眞團隊','鳳思團隊','鳳茹團隊',
      '喬卉團隊','碧雲團隊','珮慈團隊','俋準團隊'
    ]);
  }
  // Users
  if (!loadData(STORAGE_KEYS.users)) {
    saveData(STORAGE_KEYS.users, [
      { id:'u1', username:'admin', password:'admin123', name:'SHMIN', role:'admin', team:'', phone:'', email:'', status:'approved' },
      { id:'u2', username:'mika', password:'mika0812', name:'Mika', role:'mika', team:'文玲團隊', phone:'', email:'', status:'approved' },
      { id:'u3', username:'leader1', password:'leader123', name:'文玲', role:'leader', team:'文玲團隊', phone:'0912345678', email:'', status:'approved' },
      { id:'u4', username:'partner1', password:'partner123', name:'小明', role:'partner', team:'文玲團隊', phone:'0987654321', email:'partner1@test.com', status:'approved' },
      { id:'u5', username:'pending1', password:'test123', name:'待審核者', role:'partner', team:'玫眞團隊', phone:'0911222333', email:'', status:'pending' }
    ]);
  }
  // Articles
  if (!loadData(STORAGE_KEYS.articles)) {
    const now = new Date().toISOString();
    saveData(STORAGE_KEYS.articles, [
      { id:'a1', title:'歡迎加入 WishStar League！', category:'公告', content:'歡迎所有夥伴加入我們的大家庭！讓我們一起努力，創造更美好的未來。\n\n請記得每日填寫工作紀錄，讓團隊領導了解你的進展。', author:'SHMIN', authorId:'u1', target:'all', createdAt:now },
      { id:'a2', title:'本月銷售目標與重點', category:'工作要點', content:'本月重點：\n1. 新品推廣計畫啟動\n2. 客戶關係維護\n3. 團隊合作培訓\n\n請各位夥伴務必注意每日拜訪量。', author:'Mika', authorId:'u2', target:'all', createdAt:now },
      { id:'a3', title:'如何有效開發新客戶', category:'銷售技巧', content:'開發新客戶的五個步驟：\n1. 確定目標客群\n2. 準備自我介紹話術\n3. 建立信任關係\n4. 了解客戶需求\n5. 提供適合的解決方案', author:'Mika', authorId:'u2', target:'all', createdAt:now },
      { id:'a4', title:'新品上市：星光煥顏精華', category:'商品訊息', content:'全新星光煥顏精華正式上市！\n\n主要成分：玻尿酸、維他命C、膠原蛋白\n適用膚質：各種膚質\n建議售價：NT$1,680', author:'SHMIN', authorId:'u1', target:'all', createdAt:now },
      { id:'a5', title:'線上課程：溝通技巧工作坊', category:'教育訓練', content:'本週六下午2:00舉辦線上溝通技巧工作坊。\n\n課程內容：\n- 有效傾聽的藝術\n- 說服技巧\n- 處理客戶異議\n\n請夥伴們準時參加！', author:'SHMIN', authorId:'u1', target:'all', createdAt:now }
    ]);
  }
  // Work logs
  if (!loadData(STORAGE_KEYS.worklogs)) {
    const today = new Date().toISOString().split('T')[0];
    saveData(STORAGE_KEYS.worklogs, [
      { id:'w1', userId:'u4', date:today, content:'今天拜訪了3位客戶，其中1位對新品有興趣，已約下週再訪。', note:'客戶A希望看更多產品資料', feedback:{ text:'做得好！記得帶產品樣本給客戶A。', by:'文玲', byId:'u3', at:new Date().toISOString() } }
    ]);
  }
}
initDefaults();

// ============ STATE ============
let currentUser = null;
let currentPage = 'home';
let currentArticleTag = 'all';

// ============ AUTH FUNCTIONS ============
function showLogin() {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('login-form').classList.add('active');
  clearAuthMessages();
}
function showRegister() {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('register-form').classList.add('active');
  populateTeamSelect('reg-team');
  clearAuthMessages();
}
function showForgotPassword() {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('forgot-form').classList.add('active');
  clearAuthMessages();
}
function clearAuthMessages() {
  document.querySelectorAll('.error-msg, .success-msg').forEach(el => el.textContent = '');
}

function populateTeamSelect(selectId) {
  const teams = loadData(STORAGE_KEYS.teams) || [];
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const currentVal = sel.value;
  // Keep first option
  const firstOpt = sel.querySelector('option');
  sel.innerHTML = '';
  if (firstOpt) sel.appendChild(firstOpt);
  teams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  });
  if (currentVal) sel.value = currentVal;
}

function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  if (!username || !password) { errEl.textContent = '請輸入帳號和密碼'; return; }
  const users = loadData(STORAGE_KEYS.users) || [];
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) { errEl.textContent = '帳號或密碼錯誤'; return; }
  if (user.status === 'pending') { errEl.textContent = '您的帳號尚在審核中，請耐心等待管理員審核'; return; }
  // Login success
  currentUser = user;
  saveData(STORAGE_KEYS.session, user.id);
  enterApp();
}

function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const phone = document.getElementById('reg-phone').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const team = document.getElementById('reg-team').value;
  const errEl = document.getElementById('register-error');
  const sucEl = document.getElementById('register-success');
  errEl.textContent = ''; sucEl.textContent = '';
  if (!name || !username || !password || !phone || !team) { errEl.textContent = '請填寫所有必填欄位'; return; }
  const users = loadData(STORAGE_KEYS.users) || [];
  if (users.find(u => u.username === username)) { errEl.textContent = '此帳號已被使用'; return; }
  const newUser = {
    id: 'u' + Date.now(),
    username, password, name, phone, email, team,
    role: 'partner',
    status: 'pending'
  };
  users.push(newUser);
  saveData(STORAGE_KEYS.users, users);
  sucEl.textContent = '註冊成功！請等待管理員審核後即可登入。';
  document.getElementById('reg-name').value = '';
  document.getElementById('reg-username').value = '';
  document.getElementById('reg-password').value = '';
  document.getElementById('reg-phone').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-team').value = '';
}

function handleForgotPassword() {
  const email = document.getElementById('forgot-email').value.trim();
  const errEl = document.getElementById('forgot-error');
  const sucEl = document.getElementById('forgot-success');
  errEl.textContent = ''; sucEl.textContent = '';
  if (!email) { errEl.textContent = '請輸入Email'; return; }
  const users = loadData(STORAGE_KEYS.users) || [];
  const user = users.find(u => u.email === email);
  if (!user) { errEl.textContent = '查無此Email對應的帳號'; return; }
  sucEl.textContent = `您的帳號為「${user.username}」，密碼為「${user.password}」（模擬環境直接顯示）`;
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.session);
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('auth-screen').style.display = '';
  showLogin();
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
}

// ============ ENTER APP ============
function enterApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').classList.remove('hidden');
  // Set nav info
  document.getElementById('nav-username').textContent = currentUser.name;
  document.getElementById('nav-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
  // Show/hide admin sections
  const isAdmin = currentUser.role === 'admin';
  const isMika = currentUser.role === 'mika';
  const isLeader = currentUser.role === 'leader';
  const canManage = isAdmin || isMika || isLeader;
  document.getElementById('sidebar-admin').classList.toggle('hidden', !canManage);
  document.getElementById('sidebar-team-mgmt').classList.toggle('hidden', !isAdmin);
  // Worklog form visible for all roles (admin can also fill work logs)
  navigateTo('home');
  updatePendingBadge();
}

// ============ NAVIGATION ============
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  // Update sidebar active
  document.querySelectorAll('.sidebar-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
  // Close dropdown
  document.getElementById('user-dropdown').classList.remove('show');
  // Render page content
  switch(page) {
    case 'home': renderHome(); break;
    case 'articles': renderArticles(); break;
    case 'work-log': renderWorkLog(); break;
    case 'pending': renderPending(); break;
    case 'members': renderMembers(); break;
    case 'all-logs': renderAllLogs(); break;
    case 'publish': renderPublish(); break;
    case 'manage-teams': renderTeamManagement(); break;
    case 'profile': renderProfile(); break;
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('show');
}
function toggleUserMenu() {
  document.getElementById('user-dropdown').classList.toggle('show');
}
function showProfile() { navigateTo('profile'); }

// ============ RENDER: HOME ============
function renderHome() {
  document.getElementById('home-greeting').textContent = currentUser.name;
  const articles = loadData(STORAGE_KEYS.articles) || [];
  const visibleArticles = getVisibleArticles(articles);
  // Category counts
  const cats = { '公告':0, '工作要點':0, '銷售技巧':0, '商品訊息':0, '教育訓練':0 };
  visibleArticles.forEach(a => { if (cats[a.category] !== undefined) cats[a.category]++; });
  document.getElementById('count-announce').textContent = cats['公告'] + ' 篇';
  document.getElementById('count-work').textContent = cats['工作要點'] + ' 篇';
  document.getElementById('count-sales').textContent = cats['銷售技巧'] + ' 篇';
  document.getElementById('count-product').textContent = cats['商品訊息'] + ' 篇';
  document.getElementById('count-training').textContent = cats['教育訓練'] + ' 篇';
  // Latest articles (top 5)
  const latest = visibleArticles.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5);
  const container = document.getElementById('home-articles');
  container.innerHTML = latest.length ? latest.map(a => articleItemHTML(a)).join('') : emptyHTML('尚無文章');
  // Work log summary
  const logs = loadData(STORAGE_KEYS.worklogs) || [];
  const myLogs = logs.filter(l => l.userId === currentUser.id).sort((a,b) => b.date.localeCompare(a.date)).slice(0,3);
  const wlContainer = document.getElementById('home-worklogs');
  wlContainer.innerHTML = myLogs.length ? myLogs.map(l => worklogItemHTML(l, false)).join('') : emptyHTML('尚無工作紀錄');
  // Feedback alert
  const hasFeedback = logs.some(l => l.userId === currentUser.id && l.feedback);
  document.getElementById('feedback-alert').classList.toggle('hidden', !hasFeedback);
}

function getVisibleArticles(articles) {
  if (currentUser.role === 'admin' || currentUser.role === 'mika') return articles;
  return articles.filter(a => a.target === 'all' || a.target === currentUser.team);
}

function articleItemHTML(a) {
  const date = new Date(a.createdAt).toLocaleDateString('zh-TW');
  const preview = a.content.substring(0, 80).replace(/\n/g, ' ') + (a.content.length > 80 ? '...' : '');
  return `<div class="article-item" onclick="openArticle('${a.id}')">
    <div class="article-item-header">
      <span class="article-tag" data-cat="${a.category}">${a.category}</span>
      <span class="article-title">${esc(a.title)}</span>
    </div>
    <div class="article-meta">${esc(a.author)} · ${date}</div>
    <div class="article-preview">${esc(preview)}</div>
  </div>`;
}

function worklogItemHTML(log, showUser) {
  const users = loadData(STORAGE_KEYS.users) || [];
  const user = users.find(u => u.id === log.userId);
  let html = `<div class="worklog-item">
    <div class="worklog-date">${log.date}${showUser && user ? ' — ' + esc(user.name) + '（' + esc(user.team) + '）' : ''}</div>
    <div class="worklog-content">${esc(log.content)}</div>`;
  if (log.note) html += `<div class="worklog-note">${esc(log.note)}</div>`;
  if (log.feedback) {
    html += `<div class="worklog-feedback">
      <div class="worklog-feedback-label">主管回饋</div>
      <div class="worklog-feedback-text">${esc(log.feedback.text)}</div>
      <div class="worklog-feedback-meta">${esc(log.feedback.by)} · ${new Date(log.feedback.at).toLocaleDateString('zh-TW')}</div>
    </div>`;
  }
  // Feedback button for leaders/admin
  const canFeedback = (currentUser.role === 'admin' || currentUser.role === 'mika' ||
    (currentUser.role === 'leader' && user && user.team === currentUser.team));
  if (canFeedback && log.userId !== currentUser.id) {
    html += `<div style="margin-top:0.6rem;"><button class="btn btn-secondary btn-small" onclick="openFeedbackModal('${log.id}')">給予回饋</button></div>`;
  }
  html += '</div>';
  return html;
}

function emptyHTML(msg) {
  return `<div class="empty-state"><svg viewBox="0 0 24 24" width="40"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg><p>${msg}</p></div>`;
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============ RENDER: ARTICLES ============
function renderArticles() {
  filterArticles();
}

function setArticleTag(tag) {
  currentArticleTag = tag;
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.toggle('active', b.dataset.tag === tag));
  filterArticles();
}

function filterArticles() {
  const search = (document.getElementById('article-search').value || '').toLowerCase();
  const articles = loadData(STORAGE_KEYS.articles) || [];
  let visible = getVisibleArticles(articles);
  if (currentArticleTag !== 'all') visible = visible.filter(a => a.category === currentArticleTag);
  if (search) visible = visible.filter(a => a.title.toLowerCase().includes(search) || a.content.toLowerCase().includes(search));
  visible.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  document.getElementById('articles-list').innerHTML = visible.length ? visible.map(a => articleItemHTML(a)).join('') : emptyHTML('找不到符合條件的文章');
}

function filterArticlesByCategory(cat) {
  navigateTo('articles');
  currentArticleTag = cat;
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.toggle('active', b.dataset.tag === cat));
  filterArticles();
}

function openArticle(id) {
  const articles = loadData(STORAGE_KEYS.articles) || [];
  const a = articles.find(x => x.id === id);
  if (!a) return;
  const date = new Date(a.createdAt).toLocaleDateString('zh-TW');
  const body = `<h3>${esc(a.title)}</h3>
    <div style="margin-bottom:1rem;">
      <span class="article-tag" data-cat="${a.category}">${a.category}</span>
      <span style="font-size:0.9rem;color:var(--text-muted);margin-left:0.5rem;">${esc(a.author)} · ${date}</span>
    </div>
    <div style="line-height:1.8;white-space:pre-wrap;font-size:1rem;">${esc(a.content)}</div>`;
  openModal(body);
}

// ============ RENDER: WORK LOG ============
function renderWorkLog() {
  // Set today's date
  const dateInput = document.getElementById('wl-date');
  if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];
  const logs = loadData(STORAGE_KEYS.worklogs) || [];
  const myLogs = logs.filter(l => l.userId === currentUser.id).sort((a,b) => b.date.localeCompare(a.date));
  document.getElementById('my-worklogs').innerHTML = myLogs.length ? myLogs.map(l => worklogItemHTML(l, false)).join('') : emptyHTML('尚無工作紀錄，開始填寫吧！');
}

function submitWorkLog() {
  const date = document.getElementById('wl-date').value;
  const content = document.getElementById('wl-content').value.trim();
  const note = document.getElementById('wl-note').value.trim();
  if (!date || !content) { alert('請填寫日期和工作內容'); return; }
  const logs = loadData(STORAGE_KEYS.worklogs) || [];
  logs.push({ id:'w'+Date.now(), userId:currentUser.id, date, content, note, feedback:null });
  saveData(STORAGE_KEYS.worklogs, logs);
  document.getElementById('wl-content').value = '';
  document.getElementById('wl-note').value = '';
  renderWorkLog();
}

// ============ RENDER: PENDING ============
function renderPending() {
  const users = loadData(STORAGE_KEYS.users) || [];
  const pending = users.filter(u => u.status === 'pending');
  const container = document.getElementById('pending-list');
  if (!pending.length) { container.innerHTML = emptyHTML('目前沒有待審核的夥伴'); return; }
  container.innerHTML = pending.map(u => `<div class="member-item">
    <div class="member-info">
      <div class="member-avatar">${u.name.charAt(0)}</div>
      <div>
        <div class="member-name">${esc(u.name)}</div>
        <div class="member-detail">${esc(u.team)} · ${esc(u.phone)}${u.email ? ' · '+esc(u.email) : ''}</div>
      </div>
    </div>
    <div class="member-actions">
      <button class="btn btn-success btn-small" onclick="approveUser('${u.id}')">通過</button>
      <button class="btn btn-danger btn-small" onclick="deleteUser('${u.id}')">刪除</button>
    </div>
  </div>`).join('');
}

function approveUser(id) {
  const users = loadData(STORAGE_KEYS.users) || [];
  const u = users.find(x => x.id === id);
  if (u) { u.status = 'approved'; saveData(STORAGE_KEYS.users, users); }
  renderPending();
  updatePendingBadge();
}

function deleteUser(id) {
  if (!confirm('確定要刪除此帳號嗎？')) return;
  let users = loadData(STORAGE_KEYS.users) || [];
  users = users.filter(u => u.id !== id);
  saveData(STORAGE_KEYS.users, users);
  renderPending();
  renderMembers();
  updatePendingBadge();
}

function updatePendingBadge() {
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'mika')) return;
  const users = loadData(STORAGE_KEYS.users) || [];
  const count = users.filter(u => u.status === 'pending').length;
  const badge = document.getElementById('pending-badge');
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

// ============ RENDER: MEMBERS ============
function renderMembers() {
  populateTeamSelect('member-team-filter');
  // Add "all" already in HTML
  filterMembers();
}

function filterMembers() {
  const teamFilter = document.getElementById('member-team-filter').value;
  const users = loadData(STORAGE_KEYS.users) || [];
  let visible = users.filter(u => u.status === 'approved');
  // Leader can only see own team
  if (currentUser.role === 'leader') {
    visible = visible.filter(u => u.team === currentUser.team);
  }
  if (teamFilter && teamFilter !== 'all') {
    visible = visible.filter(u => u.team === teamFilter);
  }
  const container = document.getElementById('members-list');
  if (!visible.length) { container.innerHTML = emptyHTML('此團隊尚無夥伴'); return; }
  container.innerHTML = visible.map(u => {
    const roleLabel = { admin:'管理員', mika:'Mika領導人', leader:'團隊領導', partner:'一般夥伴' }[u.role] || u.role;
    const roleCls = u.role;
    let actions = '';
    if (currentUser.role === 'admin' && u.id !== currentUser.id) {
      actions = `<div class="member-actions">
        <button class="btn btn-secondary btn-small" onclick="openEditMember('${u.id}')">編輯</button>
        <button class="btn btn-danger btn-small" onclick="deleteUser('${u.id}')">刪除</button>
      </div>`;
    }
    return `<div class="member-item">
      <div class="member-info">
        <div class="member-avatar">${u.name.charAt(0)}</div>
        <div>
          <div class="member-name">${esc(u.name)} <span class="role-badge ${roleCls}">${roleLabel}</span></div>
          <div class="member-detail">${esc(u.team)} · ${esc(u.phone)}${u.email ? ' · '+esc(u.email) : ''}</div>
        </div>
      </div>
      ${actions}
    </div>`;
  }).join('');
}

function openEditMember(id) {
  const users = loadData(STORAGE_KEYS.users) || [];
  const u = users.find(x => x.id === id);
  if (!u) return;
  const teams = loadData(STORAGE_KEYS.teams) || [];
  const teamOpts = teams.map(t => `<option value="${t}" ${t===u.team?'selected':''}>${t}</option>`).join('');
  const body = `<h3>編輯夥伴資料</h3>
    <div class="form-group"><label>姓名</label><input type="text" id="edit-name" value="${esc(u.name)}"></div>
    <div class="form-group"><label>團隊</label><select id="edit-team">${teamOpts}</select></div>
    <div class="form-group"><label>角色</label><select id="edit-role">
      <option value="partner" ${u.role==='partner'?'selected':''}>一般夥伴</option>
      <option value="leader" ${u.role==='leader'?'selected':''}>團隊領導</option>
      <option value="mika" ${u.role==='mika'?'selected':''}>Mika領導人</option>
      <option value="admin" ${u.role==='admin'?'selected':''}>管理員</option>
    </select></div>
    <div class="form-group"><label>重設密碼</label><input type="text" id="edit-password" placeholder="留空表示不修改"></div>
    <button class="btn btn-primary" onclick="saveEditMember('${u.id}')">儲存</button>`;
  openModal(body);
}

function saveEditMember(id) {
  const users = loadData(STORAGE_KEYS.users) || [];
  const u = users.find(x => x.id === id);
  if (!u) return;
  u.name = document.getElementById('edit-name').value.trim() || u.name;
  u.team = document.getElementById('edit-team').value || u.team;
  u.role = document.getElementById('edit-role').value || u.role;
  const pwd = document.getElementById('edit-password').value;
  if (pwd) u.password = pwd;
  saveData(STORAGE_KEYS.users, users);
  closeModal();
  renderMembers();
}

// ============ RENDER: ALL LOGS ============
function renderAllLogs() {
  populateTeamSelect('log-team-filter');
  filterAllLogs();
}

function filterAllLogs() {
  const teamFilter = document.getElementById('log-team-filter').value;
  const logs = loadData(STORAGE_KEYS.worklogs) || [];
  const users = loadData(STORAGE_KEYS.users) || [];
  let visible = logs;
  if (currentUser.role === 'leader') {
    const teamUserIds = users.filter(u => u.team === currentUser.team).map(u => u.id);
    visible = visible.filter(l => teamUserIds.includes(l.userId));
  }
  if (teamFilter && teamFilter !== 'all') {
    const teamUserIds = users.filter(u => u.team === teamFilter).map(u => u.id);
    visible = visible.filter(l => teamUserIds.includes(l.userId));
  }
  visible.sort((a,b) => b.date.localeCompare(a.date));
  const container = document.getElementById('all-logs-list');
  container.innerHTML = visible.length ? visible.map(l => worklogItemHTML(l, true)).join('') : emptyHTML('尚無工作紀錄');
}

// ============ FEEDBACK ============
function openFeedbackModal(logId) {
  const body = `<h3>給予回饋</h3>
    <div class="form-group"><label>回饋內容</label><textarea id="feedback-text" rows="4" placeholder="請輸入您的回饋..."></textarea></div>
    <button class="btn btn-primary" onclick="submitFeedback('${logId}')">送出回饋</button>`;
  openModal(body);
}

function submitFeedback(logId) {
  const text = document.getElementById('feedback-text').value.trim();
  if (!text) { alert('請輸入回饋內容'); return; }
  const logs = loadData(STORAGE_KEYS.worklogs) || [];
  const log = logs.find(l => l.id === logId);
  if (log) {
    log.feedback = { text, by: currentUser.name, byId: currentUser.id, at: new Date().toISOString() };
    saveData(STORAGE_KEYS.worklogs, logs);
  }
  closeModal();
  // Re-render current page
  if (currentPage === 'all-logs') renderAllLogs();
  else if (currentPage === 'work-log') renderWorkLog();
  else if (currentPage === 'home') renderHome();
}

// ============ RENDER: PUBLISH ============
function renderPublish() {
  // Populate target select
  const sel = document.getElementById('pub-target');
  const teams = loadData(STORAGE_KEYS.teams) || [];
  sel.innerHTML = '<option value="all">所有人</option>';
  teams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    sel.appendChild(opt);
  });
  // Articles list: admin sees all, others see own
  const articles = loadData(STORAGE_KEYS.articles) || [];
  const isAdmin = currentUser.role === 'admin';
  const mine = (isAdmin ? articles : articles.filter(a => a.authorId === currentUser.id))
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const listTitle = isAdmin ? '所有文章管理' : '已發佈文章';
  document.getElementById('my-articles-title').textContent = listTitle;
  document.getElementById('my-articles').innerHTML = mine.length ?
    mine.map(a => {
      const date = new Date(a.createdAt).toLocaleDateString('zh-TW');
      return `<div class="article-item">
        <div class="article-item-header" onclick="openArticle('${a.id}')">
          <span class="article-tag" data-cat="${a.category}">${a.category}</span>
          <span class="article-title">${esc(a.title)}</span>
        </div>
        <div class="article-meta">${date} · 對象：${a.target === 'all' ? '所有人' : esc(a.target)}
          <button class="btn btn-danger btn-small" style="margin-left:0.8rem;" onclick="deleteArticle('${a.id}')">刪除</button>
        </div>
      </div>`;
    }).join('') : emptyHTML('您尚未發佈文章');
}

function publishArticle() {
  const title = document.getElementById('pub-title').value.trim();
  const category = document.getElementById('pub-category').value;
  const target = document.getElementById('pub-target').value;
  const content = document.getElementById('pub-content').value.trim();
  if (!title || !content) { alert('請填寫標題和內容'); return; }
  const articles = loadData(STORAGE_KEYS.articles) || [];
  articles.push({
    id: 'a' + Date.now(),
    title, category, content,
    author: currentUser.name,
    authorId: currentUser.id,
    target,
    createdAt: new Date().toISOString()
  });
  saveData(STORAGE_KEYS.articles, articles);
  document.getElementById('pub-title').value = '';
  document.getElementById('pub-content').value = '';
  alert('文章發佈成功！');
  renderPublish();
}

function deleteArticle(id) {
  if (!confirm('確定要刪除這篇文章嗎？')) return;
  let articles = loadData(STORAGE_KEYS.articles) || [];
  const article = articles.find(a => a.id === id);
  // Only allow delete if admin or own article
  if (currentUser.role !== 'admin' && article && article.authorId !== currentUser.id) {
    alert('您沒有權限刪除此文章'); return;
  }
  articles = articles.filter(a => a.id !== id);
  saveData(STORAGE_KEYS.articles, articles);
  renderPublish();
}

// ============ RENDER: TEAM MANAGEMENT ============
function renderTeamManagement() {
  const teams = loadData(STORAGE_KEYS.teams) || [];
  const container = document.getElementById('teams-list');
  container.innerHTML = teams.map(t => `<div class="team-item">
    <span>${esc(t)}</span>
    <button class="btn btn-danger btn-small" onclick="removeTeam('${esc(t)}')">刪除</button>
  </div>`).join('');
}

function addTeam() {
  const name = document.getElementById('new-team-name').value.trim();
  if (!name) { alert('請輸入團隊名稱'); return; }
  const teams = loadData(STORAGE_KEYS.teams) || [];
  if (teams.includes(name)) { alert('此團隊名稱已存在'); return; }
  teams.push(name);
  saveData(STORAGE_KEYS.teams, teams);
  document.getElementById('new-team-name').value = '';
  renderTeamManagement();
}

function removeTeam(name) {
  if (!confirm(`確定要刪除「${name}」團隊嗎？`)) return;
  let teams = loadData(STORAGE_KEYS.teams) || [];
  teams = teams.filter(t => t !== name);
  saveData(STORAGE_KEYS.teams, teams);
  renderTeamManagement();
}

// ============ RENDER: PROFILE ============
function renderProfile() {
  const roleLabel = { admin:'管理員', mika:'Mika領導人', leader:'團隊領導', partner:'一般夥伴' }[currentUser.role] || currentUser.role;
  const roleCls = currentUser.role;
  document.getElementById('profile-content').innerHTML = `
    <div class="profile-field"><div class="profile-label">姓名</div><div class="profile-value">${esc(currentUser.name)}</div></div>
    <div class="profile-field"><div class="profile-label">帳號</div><div class="profile-value">${esc(currentUser.username)}</div></div>
    <div class="profile-field"><div class="profile-label">角色</div><div class="profile-value"><span class="role-badge ${roleCls}">${roleLabel}</span></div></div>
    <div class="profile-field"><div class="profile-label">所屬團隊</div><div class="profile-value">${esc(currentUser.team) || '—'}</div></div>
    <div class="profile-field"><div class="profile-label">手機</div><div class="profile-value">${esc(currentUser.phone) || '—'}</div></div>
    <div class="profile-field"><div class="profile-label">Email</div><div class="profile-value">${esc(currentUser.email) || '—'}</div></div>
  `;
}

// ============ MODAL ============
function openModal(bodyHTML) {
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ============ SESSION RESTORE ============
(function checkSession() {
  const sessionId = loadData(STORAGE_KEYS.session);
  if (sessionId) {
    const users = loadData(STORAGE_KEYS.users) || [];
    const user = users.find(u => u.id === sessionId && u.status === 'approved');
    if (user) {
      currentUser = user;
      enterApp();
    }
  }
})();

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-right')) {
    document.getElementById('user-dropdown').classList.remove('show');
  }
});
