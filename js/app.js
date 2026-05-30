// ===== 后端配置 =====
const API_URL = "https://voxmate-server.onrender.com";
let socket = null;

// ===== State =====
let state = { page:'home', user:null, chatWith:null, msgs:{}, myGames:[], voiceJoined:null, voiceUsers:{}, buddyFilter:'', _loginTab:'login', _editProfile:false, _editAvatar:null, _editNickname:'', users:[] };

function loadState() {
  try { const s = localStorage.getItem('vm_state'); if (s) Object.assign(state, JSON.parse(s)); } catch(e) {}
}
function saveState() {
  try { localStorage.setItem('vm_state', JSON.stringify(state)); } catch(e) {}
}
loadState();

const $ = (s, p) => (p||document).querySelector(s);
const $$ = (s, p) => [...(p||document).querySelectorAll(s)];

function navigate(hash) { state.page = hash.replace('#','') || 'home'; render(); }
window.addEventListener('hashchange', () => navigate(location.hash));
window.addEventListener('load', () => navigate(location.hash));
window.navigate = navigate;

function render() {
  const pages = { home:renderHome, games:renderGames, buddy:renderBuddy, chat:renderChat, voice:renderVoice, profile:renderProfile };
  const fn = pages[state.page] || renderHome;
  if (!state.user && !['home','games','profile'].includes(state.page)) {
    $('#app').innerHTML = '<div class="rl-wrap"><span class="rl-icon">🔒</span><h2>请先登录</h2><p>登录后才能使用此功能</p><button class="btn btn-primary" onclick="location=\'#profile\'">去登录</button></div>';
    updateNav(); return;
  }
  $('#app').innerHTML = fn();
  updateNav();
  if (state.page === 'chat' && state.chatWith) setTimeout(scrollChat, 50);
  if (state.page === 'voice') setTimeout(initVoiceRooms, 50);
}
window.render = render;

function updateNav() {
  $$('.nav-link').forEach(el => el.classList.toggle('active', el.dataset.page === state.page));
  const btn = $('#navVcBtn');
  if (state.voiceJoined) { btn.style.display = 'flex'; btn.innerHTML = "\u{1F50A} "+(state.voiceUsers[state.voiceJoined]?.length||0); }
  else btn.style.display = 'none';
}

function showMsg(msg, dur=2500) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._hide);
  t._hide = setTimeout(() => t.classList.remove('show'), dur);
}
window.showMsg = showMsg; window.showToast = showMsg;

// ===== API 调用 =====
async function api(path, data) {
  try {
    const opt = { headers: { 'Content-Type': 'application/json' } };
    if (data) { opt.method = 'POST'; opt.body = JSON.stringify(data); }
    const resp = await fetch(API_URL + path, opt);
    return await resp.json();
  } catch(e) { showMsg('网络错误：' + e.message); return null; }
}

// ===== Socket.IO 连接 =====
function connectSocket(user) {
  if (socket) socket.disconnect();
  // Socket.IO with REST polling fallback - no CDN needed, we use io() from the script
  if (typeof io === 'undefined') { console.log('Socket.IO not loaded'); return; }
  socket = io(API_URL, { transports: ['websocket', 'polling'] });
  socket.on('connect', () => {
    console.log('Socket connected');
    socket.emit('user:online', { id: user.id, nickname: user.nickname, avatar: user.avatar });
  });
  socket.on('users:online', (users) => { state._onlineUsers = users; });
  socket.on('room:members', (members) => { state.voiceUsers[state.voiceJoined] = members; if (state.page === 'voice') render(); });
  socket.on('chat:new_message', (msg) => {
    const roomId = state.voiceJoined || 'lobby';
    if (!state.msgs[roomId]) state.msgs[roomId] = [];
    state.msgs[roomId].push(msg);
    if (state.page === 'voice') setTimeout(scrollChat, 50);
  });
  socket.on('disconnect', () => console.log('Socket disconnected'));
}
window.connectSocket = connectSocket;

function getAllUsers() {
  return state._onlineUsers || [];
}

// ===== 获取头像 =====
function getAvatar(id) {
  const u = getAllUsers().find(x => x.id === id);
  return u ? u.avatar : "\u{1F60E}";
}

// ===== HOME =====
function renderHome() {
  const hot = [...GAMES].sort((a,b)=>b.hot-a.hot).slice(0,10);
  const users = getAllUsers();
  return `
    <section class="hero">
      <div class="hero-tag">🎤 真人语音 · 秒连开黑</div>
      <h1 class="hero-title">找到你的<span class="gradient-text">游戏搭子</span></h1>
      <p class="hero-sub">${state.user ? '欢迎回来，'+state.user.nickname+'！' : '异环 · 三角洲 · LOL · CS2 · 语音组队平台'}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#voice">🎤 语音大厅</a>
        <a class="btn btn-outline" href="#buddy">🤝 找搭子</a>
        ${!state.user ? '<a class="btn btn-ghost" href="#profile">注册</a>' : ''}
      </div>
    </section>
    <section class="section">
      <div class="section-header"><h2>🔥 Steam热门</h2><a href="#games" class="more-link">全部 →</a></div>
      <div class="game-scroll">
        ${hot.filter(g=>g.plat==='Steam').slice(0,8).map(g => `<div class="game-card-sm" onclick="showGameDetail(${g.id})"><div class="game-sm-icon" style="background:${g.color}"><span>${g.icon}</span></div><div class="game-sm-name">${g.name}</div><div class="game-sm-num">${(g.players/1000).toFixed(0)}k</div></div>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="section-header"><h2>🔥 WeGame热门</h2><a href="#games" class="more-link">全部 →</a></div>
      <div class="game-scroll">
        ${hot.filter(g=>g.plat==='WeGame').slice(0,8).map(g => `<div class="game-card-sm" onclick="showGameDetail(${g.id})"><div class="game-sm-icon" style="background:${g.color}"><span>${g.icon}</span></div><div class="game-sm-name">${g.name}</div><div class="game-sm-num">${(g.players/1000).toFixed(0)}k</div></div>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="section-header"><h2>🌟 推荐语音频道</h2><a href="#voice" class="more-link">全部频道 →</a></div>
      ${renderHomeRooms()}
    </section>
    <section class="section">
      <div class="section-header"><h2>🟢 在线搭子 <span class="tag tag-s">${users.length}人在线</span></h2><a href="#buddy" class="more-link">全部 →</a></div>
      <div class="user-scroll">
        ${users.slice(0,10).map(u => renderUserCard(u)).join('')}
        ${!users.length ? '<p class="empty-state">暂无在线搭子</p>' : ''}
      </div>
    </section>`;
}

function renderHomeRooms() {
  return '<div class="voice-room-scroll">'+VOICE_ROOMS.slice(0,5).map(r => '<div class="vr-card-sm" onclick="location=\'#voice\'"><div class="vr-icon">'+r.icon+'</div><div class="vr-info"><div class="vr-name">'+r.name+'</div><div class="vr-count">'+r.max+'人房</div></div></div>').join('')+'</div>';
}

function renderUserCard(u) {
  return '<div class="user-card-sm" onclick="location=\'#buddy\'"><span class="user-sm-avatar">'+(u.avatar||"\u{1F60E}")+'</span><div class="user-sm-info"><div class="user-sm-name">'+(u.nickname||'')+'</div><div class="user-sm-game">'+(u.game||'找搭子')+'</div></div></div>';
}

// ===== GAMES =====
function renderGames() {
  return `<div class="page-header"><h1>🎮 游戏库</h1><p>找到你的游戏，看看谁在玩</p></div>
    <div class="game-grid">${GAMES.map(g => `<div class="game-card" onclick="showGameDetail(${g.id})"><div class="game-icon" style="background:${g.color}"><span>${g.icon}</span></div><div class="game-name">${g.name}</div><div class="game-players">${(g.players/1000).toFixed(0)}k 玩家</div><div class="game-tags">${g.tags.slice(0,2).map(t => '<span class="tag">'+t+'</span>').join('')}</div></div>`).join('')}</div>`;
}

function showGameDetail(id) {
  const g = GAMES.find(x=>x.id===id); if (!g) return;
  showMsg(g.name + '：' + g.desc + ' ｜ 找搭子去语音大厅 →');
}
window.showGameDetail = showGameDetail;

// ===== BUDDY =====
function renderBuddy() {
  const users = getAllUsers().filter(u => !state.user || u.id !== state.user.id);
  const filtered = state.buddyFilter ? users.filter(u => (u.nickname||'').includes(state.buddyFilter) || (u.game||'').includes(state.buddyFilter)) : users;
  return `<div class="page-header"><h1>🤝 找搭子</h1><p>在线搭子 · 语音开黑不孤单</p></div>
    <div class="search-bar"><span class="search-icon">🔍</span><input class="search-input" placeholder="搜索搭子（昵称/游戏）..." value="${state.buddyFilter}" oninput="state.buddyFilter=this.value;render()" /></div>
    ${filtered.length ? '<div class="user-grid">'+filtered.map(u => `<div class="user-card" onclick="location='#chat'"><div class="user-avatar">${u.avatar||"\u{1F60E}"}</div><div class="user-info"><div class="user-name">${u.nickname||''}</div><div class="user-game">🎮 ${u.game||'找搭子'}</div><div class="user-desc">${u.desc||''}</div></div><div class="user-status ${u.online?'online':'offline'}"></div></div>`).join('')+'</div>' : '<div class="empty-state">🔍 没有找到匹配的搭子<br><small>注册后就有更多搭子啦</small></div>'}`
}

// ===== CHAT =====
function renderChat() {
  const roomId = state.voiceJoined || 'lobby';
  if (!state.msgs[roomId]) state.msgs[roomId] = [];
  const msgs = state.msgs[roomId];
  return `<div class="page-header"><h1>💬 语音聊天</h1><p>${state.voiceJoined ? VOICE_ROOMS.find(r=>r.id===state.voiceJoined)?.name||'频道聊天' : '大厅聊天'}</p></div>
    <div class="chat-box" id="chatBox"><div class="chat-msgs" id="chatMsgs">${msgs.map(m => `<div class="chat-msg"><span class="chat-avatar">${m.avatar||"\u{1F60E}"}</span><div><div class="chat-name">${m.nickname||'匿名'}</div><div class="chat-text">${m.content}</div></div></div>`).join('')||'<div class="empty-state">暂无消息，开始聊天吧！</div>'}</div></div>
    <div class="chat-input-bar"><input class="chat-input" id="chatInput" placeholder="说点什么..." onkeydown="if(event.key==='Enter')sendChat()" /><button class="btn btn-primary btn-sm" onclick="sendChat()">发送</button></div>`;
}

function sendChat() {
  const input = $('#chatInput');
  if (!input||!input.value.trim()||!state.user) return;
  const roomId = state.voiceJoined || 'lobby';
  const msg = { roomId, fromId: state.user.id, content: input.value.trim(), nickname: state.user.nickname, avatar: state.user.avatar };
  if (socket) socket.emit('chat:message', msg);
  input.value = '';
}
window.sendChat = sendChat;

function scrollChat() {
  const box = $('#chatMsgs');
  if (box) box.scrollTop = box.scrollHeight;
}

// ===== VOICE =====
function renderVoice() {
  const joined = state.voiceJoined;
  const room = VOICE_ROOMS.find(r => r.id === joined);
  return `<div class="page-header"><h1>🎤 语音大厅</h1><p>${joined ? '已加入：' + (room ? room.name : '') : '选择频道加入语音'}</p></div>
    ${joined && room ? renderVoiceRoom(room) : renderVoiceList()}`;
}

function renderVoiceList() {
  return `<div class="voice-grid">${VOICE_ROOMS.map(r => {
    const users = state.voiceUsers[r.id] || [];
    return `<div class="voice-card ${state.voiceJoined === r.id ? 'joined' : ''}" onclick="joinVoiceRoom('${r.id}')">
      <div class="vc-card-head"><span class="vc-icon">${r.icon}</span><div class="vc-info"><span class="vc-name">${r.name}</span><span class="vc-game">${r.game}</span></div>
      <span class="vc-user-count">${users.length}/${r.max}</span></div>
      <p class="vc-desc">${r.desc}</p>
      ${users.length ? '<div class="vc-users">' + users.map(u => '<span class="vc-user-tag">' + u.avatar + ' ' + u.nickname + '</span>').join('') + '</div>' : '<div class="vc-empty">🟢 等待搭子加入...</div>'}</div>`;
  }).join('')}</div>`;
}

function renderVoiceRoom(room) {
  const users = state.voiceUsers[room.id] || [];
  return `<div class="voice-room-active"><div class="vr-top"><span class="vr-icon-big">${room.icon}</span><div><h2>${room.name}</h2><p>${room.desc}</p></div>
    <button class="btn btn-outline btn-sm" onclick="leaveVoiceRoom()">退出频道</button></div>
    <div class="vr-users-grid">${users.map(u => `<div class="vr-user-card"><div class="vr-user-avatar">${u.avatar}</div><div class="vr-user-name">${u.nickname}</div>
    <div class="vr-user-status online">🟢 在线</div></div>`).join('')}
    ${!users.length ? '<div class="empty-state" style="grid-column:1/-1">等待搭子加入语音频道...</div>' : ''}</div>
    <div class="chat-box" id="chatBox"><div class="chat-msgs" id="chatMsgs">${(state.msgs[room.id]||[]).map(m => `<div class="chat-msg"><span class="chat-avatar">${m.avatar||"\u{1F60E}"}</span><div><div class="chat-name">${m.nickname||'匿名'}</div><div class="chat-text">${m.content}</div></div></div>`).join('')||'<div class="empty-state">频道消息</div>'}</div></div>
    <div class="vr-controls"><div class="chat-input-bar"><input class="chat-input" id="chatInput" placeholder="说点什么..." onkeydown="if(event.key==='Enter')sendChat()" /><button class="btn btn-primary btn-sm" onclick="sendChat()">发送</button></div>
    <button class="vc-btn vc-danger" onclick="leaveVoiceRoom()">📞 离开频道</button></div></div>`;
}




window.joinVoiceRoom = joinVoiceRoom;


window.leaveVoiceRoom = leaveVoiceRoom;

// ===== PROFILE =====
function renderProfile() {
  if (!state.user) return renderLogin();
  const u = state.user;
  const myGames = state.myGames || [];
  return '<div class="page-header"><h1>👤 我的</h1></div>'+
    '<div class="profile-header"><div class="profile-avatar-wrap"><div class="profile-avatar">'+u.avatar+'</div><div class="profile-level">Lv.'+(u.level||1)+'</div></div>'+
    '<div class="profile-info"><h2>'+u.nickname+'</h2><p>'+(u.desc||'VOXMate玩家')+'</p></div></div>'+
    '<div class="profile-stats"><div class="pstat"><span class="pstat-num">0</span><span>动态</span></div><div class="pstat"><span class="pstat-num">0</span><span>搭子</span></div><div class="pstat"><span class="pstat-num">'+myGames.length+'</span><span>游戏</span></div><div class="pstat"><span class="pstat-num">0</span><span>获赞</span></div></div>'+
    '<div class="section"><h3>🎮 我的游戏</h3><div class="my-games">'+myGames.map(g => '<div class="my-game-item" onclick="showGameDetail('+g.id+')"><div class="my-game-icon" style="background:'+g.color+'"><span>'+g.icon+'</span></div><span>'+g.name+'</span></div>').join('')+'<div class="my-game-item" onclick="addGame()"><div class="my-game-icon" style="background:rgba(124,92,252,0.2)"><span>+</span></div><span>添加</span></div></div></div>'+
    '<div class="menu-list"><div class="menu-item" onclick="showEditProfile()"><span>✏️</span><span>修改资料</span><span>›</span></div><div class="menu-item danger" onclick="logout()"><span>🚪</span><span>退出登录</span><span>›</span></div></div>'+
    (state._editProfile ? renderEditProfile() : '')+
    '<div class="footer-text">VOXMate · 真人语音开黑平台</div>';
}

// ===== 修改资料 - 漂亮弹窗 =====
function showEditProfile() {
  state._editProfile = true;
  state._editNickname = state.user.nickname || '';
  state._editAvatar = state.user.avatar || "\u{1F60E}";
  render();
  document.getElementById('editNickname')?.focus();
}

function closeEditProfile() {
  state._editProfile = false;
  render();
}

function renderEditProfile() {
  const avatars = ["\u{1F60E}","\u{1F929}","\u{1F63A}","\u{1F98A}","\u{1F436}","\u{1F43C}","\u{1F981}","\u{1F42F}","\u{1F430}","\u{1F338}","\u{1F319}","\u2B50","\u{1F525}","\u{1F49C}","\u26A1","\u{1F30A}"];
  return '<div class="modal-overlay" onclick="if(event.target===this)closeEditProfile()">'+
    '<div class="modal-card"><div class="modal-header"><h2>✏️ 修改资料</h2><button class="modal-close" onclick="closeEditProfile()">✕</button></div>'+
    '<div class="modal-body"><div class="edit-avatar-section"><label>选择头像</label>'+
    '<div class="edit-avatar-grid">'+avatars.map(a => '<span class="edit-avatar-option '+(a===state._editAvatar?'selected':'')+'" onclick="state._editAvatar=\''+a+'\';$$(\'.edit-avatar-option\').forEach(el=>el.classList.remove(\'selected\'));this.classList.add(\'selected\')">'+a+'</span>').join('')+'</div></div>'+
    '<div class="edit-field"><label>昵称</label><input class="edit-input" id="editNickname" value="'+state._editNickname+'" oninput="state._editNickname=this.value" maxlength="10" placeholder="输入昵称..." /></div>'+
    '<div class="edit-field"><label>个性签名</label><input class="edit-input" id="editDesc" value="'+(state.user.desc||'')+'" oninput="state._editDesc=this.value" maxlength="30" placeholder="一句自我介绍..." /></div></div>'+
    '<div class="modal-footer"><button class="btn btn-outline" onclick="closeEditProfile()">取消</button><button class="btn btn-primary" onclick="saveEditProfile()">保存</button></div></div></div>';
}

async function saveEditProfile() {
  const nickname = state._editNickname?.trim();
  const avatar = state._editAvatar;
  const desc = state._editDesc?.trim();
  if (!nickname || nickname.length < 1) { showMsg('请输入昵称'); return; }
  state.user.nickname = nickname;
  state.user.avatar = avatar;
  state.user.desc = desc || state.user.desc;
  state._editProfile = false;
  saveState();
  render();
  showMsg('✅ 资料已更新');
}
window.saveEditProfile = saveEditProfile;

// ===== LOGIN / REGISTER =====
function renderLogin() {
  return '<div class="page-header"><h1>👤 我的</h1></div><div class="login-tabs"><button class="login-tab '+(state._loginTab!='register'?'active':'')+'" onclick="state._loginTab=\'login\';render()">登录</button><button class="login-tab '+(state._loginTab==='register'?'active':'')+'" onclick="state._loginTab=\'register\';render()">注册</button></div>'+
    (state._loginTab==='register' ? renderRegister() : renderLoginForm());
}

function renderLoginForm() {
  return '<div class="login-card"><div class="login-icon">🎮</div><p class="login-title">欢迎回到 VOXMate</p><input id="loginAcc" class="reg-input" placeholder="用户名" maxlength="20" /><input id="loginPwd" class="reg-input" type="password" placeholder="密码" maxlength="30" onkeydown="if(event.key===\'Enter\')doLogin()" /><button class="btn btn-primary btn-block" onclick="doLogin()">登录</button><p class="reg-hint">还没有账号？<a onclick="state._loginTab=\'register\';render()">立即注册</a></p></div>';
}

function renderRegister() {
  return '<div class="login-card"><div class="login-icon">🚀</div><p class="login-title">创建 VOXMate 账号</p><input id="regAcc" class="reg-input" placeholder="用户名（3位以上）" maxlength="20" /><input id="regPwd" class="reg-input" type="password" placeholder="密码（6位以上）" maxlength="30" /><input id="regName" class="reg-input" placeholder="昵称" maxlength="10" />'+
    '<div class="avatar-grid">'+["\u{1F60E}","\u{1F929}","\u{1F63A}","\u{1F98A}","\u{1F436}","\u{1F43C}","\u{1F981}","\u{1F42F}","\u{1F430}","\u{1F338}","\u{1F319}","\u2B50","\u{1F525}","\u{1F49C}","\u26A1","\u{1F30A}"].map(a => '<span class="avatar-option '+(a==="\u{1F60E}"?'selected':'')+'" onclick="$$(\'.avatar-option\').forEach(el=>el.classList.remove(\'selected\'));this.classList.add(\'selected\');state._regAvatar=\''+a+'\'">'+a+'</span>').join('')+'</div>'+
    '<button class="btn btn-primary btn-block" onclick="doRegister()">🚀 注册</button><p class="reg-hint">已有账号？<a onclick="state._loginTab=\'login\';render()">去登录</a></p></div>';
}

async function doRegister() {
  const username = $('#regAcc')?.value.trim();
  const password = $('#regPwd')?.value.trim();
  const nickname = $('#regName')?.value.trim();
  const avatar = state._regAvatar || "\u{1F60E}";
  if (!username||username.length<3) { showMsg('用户名至少3位'); return; }
  if (!password||password.length<6) { showMsg('密码至少6位'); return; }
  if (!nickname||nickname.length<1) { showMsg('请输入昵称'); return; }
  const r = await api('/api/register', { username, password, nickname, avatar });
  if (!r) return;
  if (!r.ok) { showMsg(r.msg); return; }
  state.user = r.user;
  state.myGames = GAMES.filter(g => (state.user.tags||[]).includes(g.name));
  connectSocket(r.user);
  showMsg('🎉 注册成功！'); location.hash = 'profile';
}
window.doRegister = doRegister;

async function doLogin() {
  const username = $('#loginAcc')?.value.trim();
  const password = $('#loginPwd')?.value.trim();
  if (!username||!password) { showMsg('请输入用户名和密码'); return; }
  const r = await api('/api/login', { username, password });
  if (!r) return;
  if (!r.ok) { showMsg(r.msg); return; }
  state.user = r.user;
  state.myGames = GAMES.filter(g => (state.user.tags||[]).includes(g.name));
  connectSocket(r.user);
  saveState(); showMsg('👋 欢迎回来'); location.hash = 'profile';
}
window.doLogin = doLogin;

function addGame() {
  const g = GAMES[Math.floor(Math.random()*GAMES.length)];
  if (!state.myGames.find(x=>x.id===g.id)) { state.myGames.push(g); saveState(); render(); showMsg('已添加 '+g.name); }
  else showMsg('已有该游戏');
}
window.addGame = addGame;

async function logout() {
  if (!confirm('确定退出？')) return;
  if (socket) socket.disconnect();
  state.user = null; state.voiceJoined = null; state.voiceUsers = {};
  state._onlineUsers = [];
  saveState(); render(); showMsg('已退出');
}
window.logout = logout;




