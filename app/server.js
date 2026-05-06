const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "chronicle.db");

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// Init DB
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '',
    mood TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── API Routes ──────────────────────────────────────────────

// GET all entries (summary list)
app.get("/api/entries", (req, res) => {
  const { search, tag } = req.query;
  let query = "SELECT id, title, tags, mood, created_at, updated_at, substr(content, 1, 200) as excerpt FROM entries";
  const params = [];

  const conditions = [];
  if (search) {
    conditions.push("(title LIKE ? OR content LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (tag) {
    conditions.push("tags LIKE ?");
    params.push(`%${tag}%`);
  }
  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY created_at DESC";

  const entries = db.prepare(query).all(...params);
  res.json(entries);
});

// GET single entry
app.get("/api/entries/:id", (req, res) => {
  const entry = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id);
  if (!entry) return res.status(404).json({ error: "Entry not found" });
  res.json(entry);
});

// POST create entry
app.post("/api/entries", (req, res) => {
  const { title, content, tags = "", mood = "" } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

  const now = new Date().toISOString();
  const result = db.prepare(
    "INSERT INTO entries (title, content, tags, mood, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(title.trim(), content.trim(), tags.trim(), mood.trim(), now, now);

  const entry = db.prepare("SELECT * FROM entries WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(entry);
});

// PUT update entry
app.put("/api/entries/:id", (req, res) => {
  const { title, content, tags = "", mood = "" } = req.body;
  const existing = db.prepare("SELECT id FROM entries WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Entry not found" });

  const now = new Date().toISOString();
  db.prepare(
    "UPDATE entries SET title = ?, content = ?, tags = ?, mood = ?, updated_at = ? WHERE id = ?"
  ).run(title.trim(), content.trim(), tags.trim(), mood.trim(), now, req.params.id);

  const entry = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id);
  res.json(entry);
});

// DELETE entry
app.delete("/api/entries/:id", (req, res) => {
  const existing = db.prepare("SELECT id FROM entries WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Entry not found" });
  db.prepare("DELETE FROM entries WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// GET all unique tags
app.get("/api/tags", (req, res) => {
  const rows = db.prepare("SELECT tags FROM entries WHERE tags != ''").all();
  const tagSet = new Set();
  rows.forEach(r => r.tags.split(",").forEach(t => { const trimmed = t.trim(); if (trimmed) tagSet.add(trimmed); }));
  res.json([...tagSet].sort());
});

// GET stats
app.get("/api/stats", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) as count FROM entries").get().count;
  const newest = db.prepare("SELECT created_at FROM entries ORDER BY created_at DESC LIMIT 1").get();
  const oldest = db.prepare("SELECT created_at FROM entries ORDER BY created_at ASC LIMIT 1").get();
  res.json({ total, newest: newest?.created_at, oldest: oldest?.created_at });
});

// Fallback → SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Chronicle running on port ${PORT}`));
