// ===== 高质量语音通话 (WebRTC via PeerJS) =====
let peer = null;
let localStream = null;
let currentRoom = null;
let roomCalls = {};
let callActive = false;

// 高质量音频参数
const AUDIO_CONSTRAINTS = {
  audio: {
    sampleRate: 48000,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleSize: 24
  }
};

function initPeer(userId) {
  if (peer) { peer.destroy(); peer = null; }
  peer = new Peer("vm_" + userId, {
    debug: 0,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject"
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject"
        }
      ]
    }
  });
  peer.on("open", (id) => console.log("Peer ready:", id));
  peer.on("call", handleIncomingCall);
  peer.on("error", (e) => {
    if (e.type !== "unavailable") console.log("Peer error:", e.type);
  });
}

function handleIncomingCall(call) {
  if (!localStream) {
    navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS).then(s => {
      localStream = s;
      answerCall(call);
    }).catch(() => {});
    return;
  }
  answerCall(call);
}

function answerCall(call) {
  call.answer(localStream);
  call.on("stream", (remoteStream) => {
    const audio = new Audio();
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    audio.play().catch(() => {});
  });
  call.on("close", () => {
    delete roomCalls[call.peer];
  });
  roomCalls[call.peer] = call;
}

// 加入语音频道
function joinVoiceRoom(roomId) {
  if (!state.user) { showMsg("请先登录"); location.href = "#profile"; return; }
  if (state.voiceJoined) { showMsg("已在频道中"); return; }
  
  state.voiceJoined = roomId;
  initPeer(state.user.id);
  
  // 获取麦克风（高质量）
  if (!localStream) {
    navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS).then(s => {
      localStream = s;
    }).catch(() => showMsg("⚠️ 无法访问麦克风，请允许麦克风权限"));
  }
  
  // 通知后端加入房间
  if (socket && socket.connected) {
    socket.emit("user:join_room", {
      roomId,
      user: { id: state.user.id, nickname: state.user.nickname, avatar: state.user.avatar }
    });
  }
  
  saveState();
  render();
  showMsg("🎤 已加入频道");
  updateNav();
}
window.joinVoiceRoom = joinVoiceRoom;

// 离开语音频道
function leaveVoiceRoom() {
  if (!state.voiceJoined || !state.user) return;
  
  // 关闭所有 WebRTC 连接
  Object.values(roomCalls).forEach(c => { try { c.close(); } catch(e) {} });
  roomCalls = {};
  callActive = false;
  
  // 释放麦克风
  if (localStream) {
    localStream.getTracks().forEach(t => t.stop());
    localStream = null;
  }
  
  // 销毁 Peer
  if (peer) { peer.destroy(); peer = null; }
  
  // 通知后端离开
  if (socket && socket.connected) {
    socket.emit("user:leave_room", { roomId: state.voiceJoined, userId: state.user.id });
  }
  
  state.voiceJoined = null;
  saveState();
  render();
  showMsg("已离开频道");
  updateNav();
}
window.leaveVoiceRoom = leaveVoiceRoom;

// 单人语音呼叫
function callPlayer(userId, nickname) {
  if (!state.user) { showMsg("请先登录"); return; }
  if (callActive) { showMsg("通话中"); return; }
  if (!peer) initPeer(state.user.id);
  
  showMsg("📞 正在呼叫 " + nickname + "...");
  
  navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS).then(s => {
    localStream = s;
    const targetId = "vm_" + userId;
    const call = peer.call(targetId, s);
    if (call) {
      call.on("stream", (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audio.play().catch(() => {});
        callActive = true;
        showMsg("📞 已连接 - 与 " + nickname + " 通话中");
      });
      call.on("close", () => endCall());
      roomCalls[call.peer] = call;
    }
  }).catch(() => showMsg("⚠️ 需要麦克风权限"));
}
window.callPlayer = callPlayer;

function endCall() {
  callActive = false;
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  Object.values(roomCalls).forEach(c => { try { c.close(); } catch(e) {} });
  roomCalls = {};
  showMsg("通话已结束");
}
window.endCall = endCall;

// 切换麦克风
function toggleMic() {
  if (localStream) {
    const enabled = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !enabled;
    showMsg(enabled ? "🔇 已静音" : "🎤 麦克风已开启");
  } else {
    navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS).then(s => {
      localStream = s;
      showMsg("🎤 麦克风已开启");
    }).catch(() => showMsg("⚠️ 无法访问麦克风"));
  }
}
window.toggleMic = toggleMic;

// 页面关闭时清理
window.addEventListener("beforeunload", () => {
  if (localStream) localStream.getTracks().forEach(t => t.stop());
  if (peer) peer.destroy();
});
