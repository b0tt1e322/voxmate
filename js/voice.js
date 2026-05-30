// ===== Voice Rooms (WebRTC via PeerJS) =====
let peer = null;
let peerId = null;
let localStream = null;
let currentRoom = null;
let roomPeers = {};
let callActive = false;
let callStream = null;

// Init Peer
function initPeer() {
  if (peer) return;
  const uid = state.user ? 'vm_' + state.user.id : 'vm_' + Date.now();
  peer = new Peer(uid, {
    debug: 0,
    config: { iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]}
  });
  peer.on('open', (id) => { peerId = id; });
  peer.on('call', (call) => {
    if (!localStream) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
        localStream = s;
        answerCall(call);
      }).catch(() => {});
      return;
    }
    answerCall(call);
  });
  peer.on('error', () => {});
}

function answerCall(call) {
  call.answer(localStream);
  call.on('stream', (remoteStream) => {
    const audio = new Audio();
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    audio.play();
    callStream = remoteStream;
    callActive = true;
  });
  call.on('close', () => {
    callActive = false;
    callStream = null;
  });
  roomPeers[call.peer] = call;
}

// ===== Voice Page =====
function renderVoice() {
  const joined = state.voiceJoined;
  const room = VOICE_ROOMS.find(r => r.id === joined);
  const allRooms = VOICE_ROOMS;

  return `
    <div class="page-header">
      <h1>🎤 语音大厅</h1>
      <p>${joined ? '已加入：' + (room ? room.name : '') : '选择频道加入语音'}</p>
    </div>
    ${joined && room ? renderVoiceRoom(room) : renderVoiceList(allRooms)}
  `;
}

function renderVoiceList(rooms) {
  return `
    <div class="voice-grid">
      ${rooms.map(r => {
        const users = state.voiceUsers[r.id] || [];
        return `
        <div class="voice-card ${state.voiceJoined === r.id ? 'joined' : ''}" onclick="joinVoiceRoom('${r.id}')">
          <div class="vc-card-head">
            <span class="vc-icon">${r.icon}</span>
            <div class="vc-info">
              <span class="vc-name">${r.name}</span>
              <span class="vc-game">${r.game}</span>
            </div>
            <span class="vc-user-count">${users.length}/${r.max}</span>
          </div>
          <p class="vc-desc">${r.desc}</p>
          ${users.length ? '<div class="vc-users">' + users.map(u => '<span class="vc-user-tag">' + u.avatar + ' ' + u.name + '</span>').join('') + '</div>' : '<div class="vc-empty">🟢 等待搭子加入...</div>'}
        </div>`;}).join('')}
    </div>
  `;
}

function renderVoiceRoom(room) {
  const users = state.voiceUsers[room.id] || [];
  return `
    <div class="voice-room-active">
      <div class="vr-top">
        <span class="vr-icon-big">${room.icon}</span>
        <div>
          <h2>${room.name}</h2>
          <p>${room.desc}</p>
        </div>
        <button class="btn btn-outline btn-sm" onclick="leaveVoiceRoom()">退出频道</button>
      </div>
      <div class="vr-users-grid">
        ${users.map(u => `
          <div class="vr-user-card">
            <div class="vr-user-avatar">${u.avatar}</div>
            <div class="vr-user-name">${u.name}</div>
            <div class="vr-user-status ${u.speaking ? 'speaking' : ''}">
              ${u.speaking ? '<span class="vr-wave"><span></span><span></span><span></span></span>' : '🟢 在线'}
            </div>
          </div>`).join('')}
        ${users.length === 0 ? '<div class="empty-state" style="grid-column:1/-1">等待搭子加入语音频道...</div>' : ''}
      </div>
      <div class="vr-controls">
        <button class="vc-btn ${state._micMuted ? 'muted' : ''}" onclick="toggleMic()">${state._micMuted ? '🔇 静音中' : '🎤 麦克风'}</button>
        <button class="vc-btn" onclick="inviteBuddy()">👥 邀请搭子</button>
        <button class="vc-btn vc-danger" onclick="leaveVoiceRoom()">📞 离开频道</button>
      </div>
    </div>
  `;
}

// ===== Voice Room Logic =====
function initVoiceRooms() {
  if (state.voiceJoined) {
    initPeer();
    if (!state.voiceUsers[state.voiceJoined]) {
      state.voiceUsers[state.voiceJoined] = [];
    }
    // Add self if not in room
    if (state.user && !state.voiceUsers[state.voiceJoined].find(u => u.id === state.user.id)) {
      state.voiceUsers[state.voiceJoined].push({
        id: state.user.id,
        name: state.user.name,
        avatar: state.user.avatar,
        speaking: false
      });
      saveState();
      render();
    }
    // Request mic
    if (!localStream) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
        localStream = s;
      }).catch(() => {});
    }
  }
}

function joinVoiceRoom(roomId) {
  if (!state.user) { showMsg('请先登录'); location.href = '#profile'; return; }
  if (state.voiceJoined) { showMsg('已在频道中，请先退出'); return; }

  initPeer();
  state.voiceJoined = roomId;
  if (!state.voiceUsers[roomId]) state.voiceUsers[roomId] = [];

  // Add self
  state.voiceUsers[roomId].push({
    id: state.user.id,
    name: state.user.name,
    avatar: state.user.avatar,
    speaking: false
  });

  // Try mic
  if (!localStream) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
      localStream = s;
    }).catch(() => showMsg('⚠️ 无法访问麦克风'));
  }

  saveState();
  render();
  showMsg('🎤 已加入 ' + (VOICE_ROOMS.find(r=>r.id===roomId)?.name||'语音频道'));
  updateNav();
  initVoiceRooms();
}
window.joinVoiceRoom = joinVoiceRoom;

function leaveVoiceRoom() {
  if (!state.voiceJoined) return;

  // Remove self from room
  const users = state.voiceUsers[state.voiceJoined] || [];
  if (state.user) {
    state.voiceUsers[state.voiceJoined] = users.filter(u => u.id !== state.user.id);
  }

  // Close all peer connections
  Object.values(roomPeers).forEach(p => { try { p.close(); } catch(e) {} });
  roomPeers = {};
  callActive = false;

  // Stop local stream
  if (localStream) {
    localStream.getTracks().forEach(t => t.stop());
    localStream = null;
  }

  state.voiceJoined = null;
  saveState();
  render();
  showMsg('已离开语音频道');
  updateNav();
}
window.leaveVoiceRoom = leaveVoiceRoom;

function toggleMic() {
  if (localStream) {
    const enabled = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !enabled;
    state._micMuted = enabled;
    showMsg(enabled ? '🔇 已静音' : '🎤 麦克风已开启');
    render();
  } else {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
      localStream = s;
      state._micMuted = false;
      showMsg('🎤 麦克风已开启');
      render();
    }).catch(() => showMsg('⚠️ 无法访问麦克风'));
  }
}
window.toggleMic = toggleMic;

function inviteBuddy() {
  const online = getAllUsers().filter(u => u.online && (!state.user || u.id !== state.user.id));
  if (!online.length) { showMsg('暂无其他在线搭子'); return; }
  const names = online.slice(0, 5).map(u => u.name).join('、');
  showMsg('已邀请：' + names + ' 等 ' + online.length + ' 位搭子加入语音');
}
window.inviteBuddy = inviteBuddy;

// ===== 1-on-1 Voice Call =====
function callPlayer(id, name) {
  if (!state.user) { showMsg('请先登录'); location.href = '#profile'; return; }
  if (callActive) { showMsg('通话中'); return; }

  initPeer();
  state.chatWith = { id, name };
  showMsg('📞 正在呼叫 ' + name + '...');

  navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
    localStream = s;
    const targetId = 'vm_' + id;
    const call = peer.call(targetId, s);
    if (call) {
      call.on('stream', (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audio.play();
        callStream = remoteStream;
        callActive = true;
        state._callStart = Date.now();
        state.inCall = true;
        showMsg('📞 已连接 - 与 ' + name + ' 通话中');
        render();
      });
      call.on('close', () => {
        endCall();
      });
      roomPeers[call.peer] = call;
    }
  }).catch(() => showMsg('⚠️ 需要麦克风权限'));
}
window.callPlayer = callPlayer;

function endCall() {
  callActive = false;
  state.inCall = false;
  state._callStart = null;
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  callStream = null;
  Object.values(roomPeers).forEach(p => { try { p.close(); } catch(e) {} });
  roomPeers = {};
  showMsg('通话已结束');
  render();
}
window.endCall = endCall;

function toggleCallMic() {
  if (localStream) {
    const en = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !en;
    state._callMicOff = en;
    showMsg(en ? '🔇 静音' : '🎤 已开麦');
  }
}
window.toggleCallMic = toggleCallMic;

// Self-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); }
});
