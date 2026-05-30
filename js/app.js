// ===== State =====
let state = { page:'home', user:null, chatWith:null, msgs:{}, myGames:[], voiceJoined:null, voiceUsers:{}, buddyFilter:'', _loginTab:'login', _callStart:null, _callMicOff:false, users:[] };

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
  if (state.voiceJoined) { btn.style.display = 'flex'; btn.innerHTML = '🔊 '+(state.voiceUsers[state.voiceJoined]?.length||0); }
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

function getAvatar(id) {
  const u = getAllUsers().find(x => x.id === id);
  return u ? u.avatar : '😎';
}

function getAllUsers() {
  const us = [...REAL_PLAYERS];
  if (state.user && !us.find(u => u.id === state.user.id)) {
    us.unshift({ ...state.user, online: true, vc: true });
  }
  return us;
}
// ===== HOME =====
function renderHome() {
  const hot = [...GAMES].sort((a,b)=>b.hot-a.hot).slice(0,10);
  const users = getAllUsers().filter(u => u.online);
  const posts = getAllPosts();
  return `
    <section class="hero">
      <div class="hero-tag">🎤 真人语音 · 秒连开黑</div>
      <h1 class="hero-title">找到你的<span class="gradient-text">游戏搭子</span></h1>
      <p class="hero-sub">${state.user ? '欢迎回来，'+state.user.name+'！' : '异环 · 三角洲 · LOL · CS2 · 语音组队平台'}</p>
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
      <div class="voice-room-scroll">
        ${VOICE_ROOMS.slice(0,5).map(r => `<div class="vr-card-sm" onclick="location='#voice'"><div class="vr-icon">${r.icon}</div><div class="vr-info"><div class="vr-name">${r.name}</div><div class="vr-count">${r.max}人房</div></div></div>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="section-header"><h2>🟢 在线搭子 <span style="font-size:13px;color:#888;font-weight:400">${users.length}人</span></h2><a href="#buddy" class="more-link">全部 →</a></div>
      <div class="buddy-scroll">
        ${users.slice(0,10).map(u => `<div class="buddy-card-sm" onclick="startChat(${u.id},'${u.name}')"><div class="buddy-avatar"><span>${u.avatar}</span><span class="online-dot"></span></div><div class="buddy-name">${u.name}</div><div class="buddy-game">${u.game}</div></div>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="section-header"><h2>💬 最新动态</h2></div>
      <div class="post-list">
        ${posts.length ? posts.map(p => `<div class="post-card"><div class="post-head"><span class="post-avatar">${p.avatar}</span><div class="post-user"><span class="post-name">${p.author}</span><span class="post-time">${p.time}</span></div><span class="post-game-tag">${p.game}</span></div><p class="post-content">${p.content}</p><div class="post-tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div><div class="post-foot"><span>💬 ${p.comments||0}</span><span>👍 ${p.likes||0}</span></div></div>`).join('') : '<div class="empty-state">暂无动态 · 去 <a href="#buddy" style="color:#7c5cfc">找搭子</a> 一起玩吧！</div>'}
      </div>
    </section>
  `;
}

function getAllPosts() {
  try { return JSON.parse(localStorage.getItem('vm_posts')||'[]'); } catch(e) { return []; }
}
function savePost(post) {
  const p = getAllPosts(); p.unshift(post); localStorage.setItem('vm_posts', JSON.stringify(p));
}
// ===== GAMES =====
let gameFilter = { cat:0, plat:'all' };

function renderGames() {
  let list = [...GAMES];
  if (gameFilter.plat !== 'all') list = list.filter(g => g.plat === gameFilter.plat);
  if (gameFilter.cat > 0) {
    const cat = CATEGORIES[gameFilter.cat];
    list = list.filter(g => g.cat.includes(cat) || g.tags.includes(cat));
  }
  return '<div class="page-header"><h1>🎮 游戏库</h1><p>'+GAMES.length+'款热门游戏 · 语音组队</p></div>'+
    '<div class="filter-bar"><div class="plat-tabs">'+['all','Steam','WeGame','全平台'].map(p => '<button class="plat-tab '+(gameFilter.plat===p?'active':'')+'" onclick="setPlat(\''+p+'\')">'+(p==='all'?'全部':p)+'</button>').join('')+'</div>'+
    '<div class="cat-scroll">'+CATEGORIES.map((c,i) => '<span class="cat-tag '+(gameFilter.cat===i?'active':'')+'" onclick="setCat('+i+')">'+c+'</span>').join('')+'</div></div>'+
    '<div class="game-grid">'+list.map(g => '<div class="game-card" onclick="showGameDetail('+g.id+')"><div class="game-card-icon" style="background:'+g.color+'"><span>'+g.icon+'</span></div><div class="game-card-body"><div class="game-card-header"><span class="game-card-name">'+g.name+'</span><span class="game-card-rating">⭐'+g.rating+'</span></div><div class="game-card-tags">'+g.tags.map(t=>'<span class="tag">'+t+'</span>').join('')+'<span class="tag '+(g.plat==='Steam'?'tag-s':'tag-w')+'">'+g.plat+'</span></div><div class="game-card-foot"><span>'+g.cat+'</span><span>🟢 '+g.players.toLocaleString()+'人在玩</span></div></div></div>').join('')+'</div>'+
    '<div class="list-end">共 '+list.length+' 款游戏</div>';
}
function setPlat(p) { gameFilter.plat = p; render(); }
function setCat(i) { gameFilter.cat = i; render(); }
window.setPlat = setPlat; window.setCat = setCat;

function showGameDetail(id) {
  const g = GAMES.find(x => x.id === id); if (!g) return;
  const ov = document.createElement('div'); ov.className = 'modal-overlay';
  ov.innerHTML = '<div class="modal"><span class="modal-close" onclick="this.parentElement.parentElement.remove()">✕</span><div class="modal-icon" style="background:'+g.color+';font-size:60px">'+g.icon+'</div><h2>'+g.name+'</h2>'+(g.en?'<p class="modal-en">'+g.en+'</p>':'')+'<p class="modal-desc">'+g.desc+'</p><div class="modal-stats"><span>🔥 '+g.hot+'</span><span>⭐ '+g.rating+'分</span><span>🟢 '+g.players.toLocaleString()+'人在线</span></div><div class="modal-tags">'+g.tags.map(t=>'<span class="tag">'+t+'</span>').join('')+'<span class="tag '+(g.plat==='Steam'?'tag-s':'tag-w')+'">'+g.plat+'</span></div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn btn-primary" onclick="this.closest(\'.modal-overlay\').remove();location=\'#voice\'">🎤 语音组队</button><button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove();state.buddyFilter=\''+g.name+'\';location=\'#buddy\'">🤝 找搭子</button></div></div>';
  document.body.appendChild(ov);
}
window.showGameDetail = showGameDetail;

// ===== BUDDY =====
function renderBuddy() {
  const filter = state.buddyFilter || '';
  let users = getAllUsers().filter(u => u.online);
  const games = [...new Set(users.map(u => u.game))].sort();
  const filtered = filter ? users.filter(u => u.game === filter) : users;
  return '<div class="page-header"><h1>🤝 真人搭子</h1><p>🟢 '+users.length+' 人在线 · 全部真人玩家</p></div>'+
    '<div class="filter-bar"><div class="cat-scroll"><span class="cat-tag '+(!filter?'active':'')+'" onclick="state.buddyFilter=\'\';render()">全部</span>'+
    games.map(g => '<span class="cat-tag '+(filter===g?'active':'')+'" onclick="state.buddyFilter=\''+g+'\';render()">'+g+'</span>').join('')+'</div></div>'+
    '<div class="player-grid">'+filtered.map(u => '<div class="player-card"><div class="player-head"><span class="player-avatar">'+u.avatar+'</span><div class="player-info"><span class="player-name">'+u.name+'</span><span class="player-level">'+u.level+'</span></div><span class="player-online"></span></div><div class="player-game-tag">'+u.game+' · '+u.mode+'</div><p class="player-desc">'+u.desc+'</p><div class="player-tags">'+u.tags.map(t => '<span class="tag">'+t+'</span>').join('')+'</div><div class="player-actions"><button class="btn btn-primary btn-sm" onclick="startChat('+u.id+',\''+u.name+'\')">💬 私聊</button><button class="btn btn-outline btn-sm" onclick="callPlayer('+u.id+',\''+u.name+'\')">🎤 语音</button></div></div>').join('')+
    (!filtered.length ? '<div class="empty-state">暂无在线搭子 · <a href="#voice" style="color:#7c5cfc">去语音大厅</a></div>' : '')+'</div>';
}
// ===== CHAT =====
function renderChat() {
  const c = state.chatWith;
  if (!c) {
    const users = getAllUsers().filter(u => u.online);
    return '<div class="page-header"><h1>💬 消息</h1></div>'+
      '<div class="chat-list">'+users.map(u => '<div class="chat-list-item" onclick="startChat('+u.id+',\''+u.name+'\')"><span class="cli-avatar">'+u.avatar+'</span><div class="cli-info"><span class="cli-name">'+u.name+'</span><span class="cli-game">'+u.game+'</span></div><span class="cli-status">🟢</span></div>').join('')+'</div>';
  }
  return renderChatView();
}

function startChat(id, name) { state.chatWith = { id, name }; state.page = 'chat'; render(); }
window.startChat = startChat;
function closeChat() { state.chatWith = null; render(); }
window.closeChat = closeChat;
function scrollChat() { const el = $('.chat-msgs'); if (el) el.scrollTop = el.scrollHeight; }

function renderChatView() {
  const c = state.chatWith; if (!c) return '';
  const msgs = state.msgs[c.id] || [];
  return '<div class="chat-view"><div class="chat-head"><button class="btn-icon" onclick="closeChat()">‹</button><div class="ch-info"><span class="ch-name">'+c.name+'</span><span class="ch-status">🟢 在线</span></div><button class="btn-icon call-btn-icon" onclick="callPlayer('+c.id+',\''+c.name+'\')">📞</button></div>'+
    '<div class="chat-msgs">'+msgs.map(m => '<div class="msg '+(m.isSelf?'msg-self':'msg-other')+'">'+
    (m.type==='voice' ? '<div class="voice-msg" onclick="playVoiceMsg(\''+m.url+'\')"><span class="voice-icon">🎤</span><div class="voice-wave"><span></span><span></span><span></span></div><span class="voice-dur">'+m.duration+'″</span></div>' :
    m.type==='image' ? '<img class="chat-img" src="'+m.url+'" onclick="window.open(this.src)">' :
    '<span>'+m.text+'</span>')+'<span class="msg-time">'+m.time+'</span></div>').join('')+'</div>'+
    '<div class="chat-input-bar"><button class="chat-tool" onclick="voiceMsg()">🎤</button><button class="chat-tool" onclick="sendPhoto()">📷</button><input class="chat-input" id="chatInput" placeholder="说点什么..." onkeydown="if(event.key===\'Enter\')sendText()" /><button class="btn btn-primary btn-sm" onclick="sendText()">发送</button></div></div>';
}

function sendText() {
  const inp = $('#chatInput');
  if (!inp||!inp.value.trim()||!state.chatWith) return;
  addMsg({ text:inp.value.trim(), type:'text', isSelf:true }); inp.value = '';
  setTimeout(() => { const r = ['来了来了！','开黑吗？开语音','我在语音频道等你','加个好友','走起！🎮','好的组我']; addMsg({ text:r[Math.floor(Math.random()*r.length)], type:'text', isSelf:false }); }, 1500);
}
window.sendText = sendText;

function addMsg(msg) {
  const cid = state.chatWith.id;
  msg.time = new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});
  if (!state.msgs[cid]) state.msgs[cid] = [];
  state.msgs[cid].push(msg); saveState();
  render(); setTimeout(scrollChat, 50);
}

// Voice msg
let mediaRec = null, audioChunks = [];
function voiceMsg() {
  if (mediaRec?.state === 'recording') { mediaRec.stop(); return; }
  navigator.mediaDevices.getUserMedia({ audio:true }).then(s => {
    audioChunks = []; mediaRec = new MediaRecorder(s);
    mediaRec.ondataavailable = e => { if (e.data.size>0) audioChunks.push(e.data); };
    mediaRec.onstop = () => {
      s.getTracks().forEach(t=>t.stop());
      if (!audioChunks.length) return;
      const blob = new Blob(audioChunks, { type:'audio/webm' });
      const url = URL.createObjectURL(blob);
      const dur = Math.max(1, Math.min(Math.round(blob.size/16000), 60));
      addMsg({ type:'voice', url, duration:dur, isSelf:true }); mediaRec = null;
    };
    mediaRec.start(); showMsg('🎤 录音中...');
    setTimeout(() => { if (mediaRec?.state==='recording') mediaRec.stop(); }, 30000);
  }).catch(() => showMsg('⚠️ 需要麦克风权限'));
}
window.voiceMsg = voiceMsg;
function playVoiceMsg(url) { new Audio(url).play(); }
window.playVoiceMsg = playVoiceMsg;

function sendPhoto() {
  const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.style.display='none';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = e => addMsg({ type:'image', url:e.target.result, isSelf:true });
    r.readAsDataURL(f);
  };
  document.body.appendChild(inp); inp.click(); inp.remove();
}
window.sendPhoto = sendPhoto;
// ===== PROFILE / LOGIN =====
function renderProfile() {
  if (!state.user) return renderLogin();
  const u = state.user;
  const myGames = state.myGames.length ? state.myGames : GAMES.filter(g => (u.tags||[]).includes(g.name));
  return '<div class="profile"><div class="profile-card"><div class="profile-avatar">'+u.avatar+'</div><div class="profile-info"><h2>'+u.name+'</h2><div class="profile-badges"><span class="tag">🏆 Lv.'+(u.level||1)+'</span><span class="tag">'+(u.game||'待组队')+'</span>'+(u.vc?'<span class="tag tag-vc">🎤 语音</span>':'')+'</div></div><button class="btn btn-outline btn-sm" onclick="editProfile()">✏️</button></div>'+
    '<div class="profile-stats"><div class="pstat"><span class="pstat-num">'+(u.posts||0)+'</span><span>动态</span></div><div class="pstat"><span class="pstat-num">'+(u.buddies||0)+'</span><span>搭子</span></div><div class="pstat"><span class="pstat-num">'+myGames.length+'</span><span>游戏</span></div><div class="pstat"><span class="pstat-num">'+(u.likes||0)+'</span><span>获赞</span></div></div>'+
    '<div class="section"><h3>🎮 我的游戏</h3><div class="my-games">'+myGames.map(g => '<div class="my-game-item" onclick="showGameDetail('+g.id+')"><div class="my-game-icon" style="background:'+g.color+'"><span>'+g.icon+'</span></div><span>'+g.name+'</span></div>').join('')+'<div class="my-game-item" onclick="addGame()"><div class="my-game-icon" style="background:rgba(124,92,252,0.2)"><span>+</span></div><span>添加</span></div></div></div>'+
    '<div class="menu-list"><div class="menu-item" onclick="publishPost()"><span>📝</span><span>发布动态</span><span>›</span></div><div class="menu-item" onclick="showMsg(\'❤️ 暂无收藏\')"><span>❤️</span><span>收藏的搭子</span><span class="menu-val">0位</span><span>›</span></div><div class="menu-item" onclick="editProfile()"><span>✏️</span><span>修改资料</span><span>›</span></div><div class="menu-item" onclick="changePwd()"><span>🔑</span><span>修改密码</span><span>›</span></div><div class="menu-item danger" onclick="logout()"><span>🚪</span><span>退出登录</span><span>›</span></div></div>'+
    '<div class="footer-text">VOXMate · 真人语音开黑平台</div></div>';
}

function renderLogin() {
  return '<div class="page-header"><h1>👤 我的</h1></div><div class="login-tabs"><button class="login-tab '+(state._loginTab!='register'?'active':'')+'" onclick="state._loginTab=\'login\';render()">登录</button><button class="login-tab '+(state._loginTab==='register'?'active':'')+'" onclick="state._loginTab=\'register\';render()">注册</button></div>'+
    (state._loginTab==='register' ? renderRegister() : renderLoginForm());
}

function renderLoginForm() {
  return '<div class="login-card"><div class="login-icon">🎮</div><p class="login-title">欢迎回到 VOXMate</p><input id="loginAcc" class="reg-input" placeholder="账号" maxlength="20" /><input id="loginPwd" class="reg-input" type="password" placeholder="密码" maxlength="30" onkeydown="if(event.key===\'Enter\')doLogin()" /><button class="btn btn-primary btn-block" onclick="doLogin()">登录</button><p class="reg-hint">还没有账号？<a onclick="state._loginTab=\'register\';render()">立即注册</a></p></div>';
}

function renderRegister() {
  return '<div class="login-card"><div class="login-icon">🚀</div><p class="login-title">创建 VOXMate 账号</p><input id="regAcc" class="reg-input" placeholder="账号（4-20位字母数字）" maxlength="20" /><input id="regPwd" class="reg-input" type="password" placeholder="密码（6-30位）" maxlength="30" /><input id="regName" class="reg-input" placeholder="昵称（2-10字）" maxlength="10" />'+
    '<div class="avatar-grid">'+['😎','🤩','😺','🦊','🐶','🐼','🐯','🦁','🐰','🌸','🌙','⭐','🔥','💜','⚡','🌊'].map(a => '<span class="avatar-option '+(a==='😎'?'selected':'')+'" onclick="$$(\'.avatar-option\').forEach(el=>el.classList.remove(\'selected\'));this.classList.add(\'selected\');state._regAvatar=\''+a+'\'">'+a+'</span>').join('')+'</div>'+
    '<div class="reg-games"><span class="tag tag-s">选择常玩游戏</span><div class="reg-game-grid">'+GAMES.slice(0,12).map(g => '<span class="reg-game-option" onclick="this.classList.toggle(\'selected\')" data-game="'+g.name+'"><span>'+g.icon+'</span><span>'+g.name.slice(0,4)+'</span></span>').join('')+'</div></div>'+
    '<button class="btn btn-primary btn-block" onclick="doRegister()">🚀 注册</button><p class="reg-hint">已有账号？<a onclick="state._loginTab=\'login\';render()">去登录</a></p></div>';
}

function getAccs() { try { return JSON.parse(localStorage.getItem('vm_accs')||'{}'); } catch(e) { return {}; } }
function saveAccs(a) { localStorage.setItem('vm_accs', JSON.stringify(a)); }

function doRegister() {
  const acc = $('#regAcc')?.value.trim();
  const pwd = $('#regPwd')?.value.trim();
  const name = $('#regName')?.value.trim();
  const avatar = state._regAvatar || '😎';
  if (!acc||acc.length<4) { showMsg('请输入账号（4-20位）'); return; }
  if (!pwd||pwd.length<6) { showMsg('密码至少6位'); return; }
  if (!name||name.length<2) { showMsg('请输入昵称（2-10字）'); return; }
  const accs = getAccs();
  if (accs[acc]) { showMsg('账号已存在'); return; }
  const selected = $$('.reg-game-option.selected').map(el => el.dataset.game);
  const user = { id:Date.now(), account:acc, name, avatar, level:1, game:selected[0]||'', tags:selected.slice(0,3), posts:0, buddies:0, likes:0, favs:0, online:true, vc:true, desc:'新加入VOXMate！' };
  accs[acc] = { password:pwd, user };
  saveAccs(accs); state.user = user;
  state.myGames = GAMES.filter(g => selected.includes(g.name));
  showMsg('🎉 注册成功！'); location.hash = 'profile';
}
window.doRegister = doRegister;

function doLogin() {
  const acc = $('#loginAcc')?.value.trim();
  const pwd = $('#loginPwd')?.value.trim();
  if (!acc||!pwd) { showMsg('请输入账号和密码'); return; }
  const accs = getAccs(); const r = accs[acc];
  if (!r) { showMsg('账号不存在，请注册'); return; }
  if (r.password !== pwd) { showMsg('密码错误'); return; }
  state.user = { ...r.user, online:true, vc:true };
  state.myGames = GAMES.filter(g => (state.user.tags||[]).includes(g.name));
  saveState(); showMsg('👋 欢迎回来'); location.hash = 'profile';
}
window.doLogin = doLogin;

function changePwd() {
  const old = prompt('当前密码：'); if (!old) return;
  const accs = getAccs(); const r = accs[state.user.account];
  if (r.password!==old) { showMsg('密码错误'); return; }
  const n = prompt('新密码（6位以上）：'); if (!n||n.length<6) { showMsg('至少6位'); return; }
  r.password = n; saveAccs(accs); showMsg('✅ 已修改');
}
window.changePwd = changePwd;

function editProfile() {
  const n = prompt('修改昵称：', state.user.name);
  if (n&&n.trim()) {
    state.user.name = n.trim();
    const accs = getAccs();
    if (accs[state.user.account]) accs[state.user.account].user.name = n.trim();
    saveAccs(accs); saveState(); render(); showMsg('✅ 已更新');
  }
}
window.editProfile = editProfile;

function addGame() {
  const g = GAMES[Math.floor(Math.random()*GAMES.length)];
  if (!state.myGames.find(x=>x.id===g.id)) { state.myGames.push(g); saveState(); render(); showMsg('已添加 '+g.name); }
  else showMsg('已有该游戏');
}
window.addGame = addGame;

function publishPost() {
  const c = prompt('写点动态吧：');
  if (!c||!c.trim()) return;
  savePost({ author:state.user.name, avatar:state.user.avatar, game:state.user.game||'找搭子', content:c.trim(), tags:['语音','开黑','VOXMate'], comments:0, likes:0, time:new Date().toLocaleDateString('zh-CN') });
  if (state.user) state.user.posts = (state.user.posts||0)+1;
  saveState(); showMsg('📝 已发布'); render();
}
window.publishPost = publishPost;

function logout() {
  if (!confirm('确定退出？')) return;
  state.user = null; state.voiceJoined = null; state.voiceUsers = {};
  if (typeof leaveVoiceRoom === 'function') leaveVoiceRoom();
  saveState(); render(); showMsg('已退出');
}
window.logout = logout;
