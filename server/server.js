import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import bcrypt from "bcryptjs";
import initSqlJs from "sql.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "voxmate.db");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
app.use(cors());
app.use(express.json());

let db;

async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, nickname TEXT NOT NULL, avatar TEXT DEFAULT '\u{1F60E}', game TEXT DEFAULT '', tags TEXT DEFAULT '[]', desc TEXT DEFAULT '新加入VOXMate！', level TEXT DEFAULT '1', online INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))");
  db.run("CREATE TABLE IF NOT EXISTS voice_rooms (id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT DEFAULT '\u{1F3AE}', game TEXT DEFAULT '综合', desc TEXT DEFAULT '', max_users INTEGER DEFAULT 8)");
  db.run("CREATE TABLE IF NOT EXISTS room_members (room_id TEXT NOT NULL, user_id INTEGER NOT NULL, joined_at TEXT DEFAULT (datetime('now')), PRIMARY KEY (room_id, user_id))");
  db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, from_id INTEGER NOT NULL, to_id INTEGER, room_id TEXT, content TEXT NOT NULL, type TEXT DEFAULT 'chat', created_at TEXT DEFAULT (datetime('now')))");
  const count = db.exec("SELECT COUNT(*) as c FROM voice_rooms");
  if (!count.length || !count[0].values.length || count[0].values[0][0] === 0) {
    const rooms = [
      ["vr1", "LOL峡谷开黑", "\u{1F3C6}", "英雄联盟", "峡谷召唤师集合，排位开黑语音", 6],
      ["vr2", "CS2完美竞技", "\u{1F4A5}", "CS2", "完美平台竞技，战术配合", 5],
      ["vr3", "PUBG绝地求生", "\u{1FA82}", "PUBG", "四排语音吃鸡", 4],
      ["vr4", "永劫无间", "\u{1F5E1}\uFE0F", "永劫无间", "三排冲分，振刀配合", 3],
      ["vr5", "原神提瓦特", "\u2B50", "原神", "周本联机语音", 4],
      ["vr6", "自由开黑", "\u{1F3AE}", "综合", "任何游戏自由组队", 10],
      ["vr7", "闲聊摸鱼", "\u2615", "综合", "不打游戏时聊天交朋友", 10]
    ];
    for (const r of rooms) db.run("INSERT INTO voice_rooms VALUES (?,?,?,?,?,?)", r);
  }
  saveDB();
  console.log("DB ready, " + db.exec("SELECT COUNT(*) as c FROM voice_rooms")[0].values[0][0] + " rooms");
}

function saveDB() {
  try { fs.writeFileSync(DB_PATH, Buffer.from(db.export())); } catch(e) {}
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

app.post("/api/register", (req, res) => {
  try {
    const { username, password, nickname, avatar } = req.body;
    if (!username || !password || !nickname) return res.json({ ok: false, msg: "请填完整信息" });
    if (username.length < 3) return res.json({ ok: false, msg: "用户名至少3位" });
    if (password.length < 6) return res.json({ ok: false, msg: "密码至少6位" });
    if (query("SELECT id FROM users WHERE username = ?", [username]).length) return res.json({ ok: false, msg: "用户名已存在" });
    const hash = bcrypt.hashSync(password, 10);
    run("INSERT INTO users (username, password, nickname, avatar) VALUES (?,?,?,?)", [username, hash, nickname, avatar || "\u{1F60E}"]);
    const user = query("SELECT id, username, nickname, avatar, game, level, desc, online FROM users WHERE username = ?", [username])[0];
    res.json({ ok: true, user });
  } catch (e) { res.json({ ok: false, msg: e.message }); }
});

app.post("/api/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const users = query("SELECT * FROM users WHERE username = ?", [username]);
    if (!users.length) return res.json({ ok: false, msg: "用户不存在" });
    const user = users[0];
    if (!bcrypt.compareSync(password, user.password)) return res.json({ ok: false, msg: "密码错误" });
    run("UPDATE users SET online = 1 WHERE id = ?", [user.id]);
    const u = { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, game: user.game, tags: JSON.parse(user.tags || "[]"), level: user.level, desc: user.desc, online: 1 };
    res.json({ ok: true, user: u });
  } catch (e) { res.json({ ok: false, msg: e.message }); }
});

app.get("/api/users", (req, res) => {
  const users = query("SELECT id, username, nickname, avatar, game, level, desc, online, tags FROM users");
  res.json(users.map(u => ({ ...u, tags: JSON.parse(u.tags || "[]") })));
});

app.get("/api/rooms", (req, res) => {
  const rooms = query("SELECT * FROM voice_rooms");
  const counts = query("SELECT room_id, COUNT(*) as count FROM room_members GROUP BY room_id");
  const cmap = {};
  for (const c of counts) cmap[c.room_id] = c.count;
  res.json(rooms.map(r => ({ ...r, current_users: cmap[r.id] || 0 })));
});

app.get("/api/messages/:roomId", (req, res) => {
  const msgs = query("SELECT m.*, u.nickname, u.avatar FROM messages m LEFT JOIN users u ON m.from_id = u.id WHERE m.room_id = ? ORDER BY m.created_at ASC LIMIT 100", [req.params.roomId]);
  res.json(msgs);
});

const onlineUsers = new Map();
io.on("connection", (socket) => {
  socket.on("user:online", (user) => {
    if (!user || !user.id) return;
    onlineUsers.set(user.id, { socketId: socket.id, userInfo: user });
    run("UPDATE users SET online = 1 WHERE id = ?", [user.id]);
    socket.userId = user.id;
    io.emit("users:online", Array.from(onlineUsers.values()).map(v => v.userInfo));
  });
  socket.on("user:join_room", ({ roomId, user }) => {
    if (!roomId || !user) return;
    socket.join("room:" + roomId);
    try { run("INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?,?)", [roomId, user.id]); } catch(e) {}
    const members = query("SELECT u.id, u.nickname, u.avatar FROM room_members rm JOIN users u ON rm.user_id = u.id WHERE rm.room_id = ?", [roomId]);
    io.to("room:" + roomId).emit("room:members", members);
  });
  socket.on("user:leave_room", ({ roomId, userId }) => {
    if (!roomId || !userId) return;
    socket.leave("room:" + roomId);
    run("DELETE FROM room_members WHERE room_id = ? AND user_id = ?", [roomId, userId]);
    const members = query("SELECT u.id, u.nickname, u.avatar FROM room_members rm JOIN users u ON rm.user_id = u.id WHERE rm.room_id = ?", [roomId]);
    io.to("room:" + roomId).emit("room:members", members);
  });
  socket.on("chat:message", ({ roomId, fromId, content, nickname, avatar }) => {
    if (!roomId || !fromId || !content) return;
    run("INSERT INTO messages (from_id, room_id, content, type) VALUES (?,?,?,?)", [fromId, roomId, content, "chat"]);
    const msg = query("SELECT m.* FROM messages m WHERE m.id = (SELECT MAX(id) FROM messages)")[0];
    if (msg) { msg.nickname = nickname; msg.avatar = avatar; }
    io.to("room:" + roomId).emit("chat:new_message", msg);
  });
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      run("UPDATE users SET online = 0 WHERE id = ?", [socket.userId]);
      io.emit("users:online", Array.from(onlineUsers.values()).map(v => v.userInfo));
    }
  });
});

initDB().then(() => {
  httpServer.listen(process.env.PORT || 3000, () => console.log("VOXMate server running on port " + (process.env.PORT || 3000)));
}).catch(e => console.error("Init error:", e));
