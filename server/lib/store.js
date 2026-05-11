const fs   = require('fs');
const path = require('path');

const DATA_DIR   = path.join(__dirname, '../data');
const BACKUP_DIR = path.join(__dirname, '../data/backups');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

class DataStore {
  constructor(name) {
    this.name = name;
    this.file = path.join(DATA_DIR, `${name}.json`);
    this._data = [];
    this._queue = Promise.resolve();
    this._load();
  }

  _load() {
    try {
      this._data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch {
      this._data = [];
    }
  }

  _flush() {
    this._queue = this._queue.then(() => {
      try {
        fs.writeFileSync(this.file, JSON.stringify(this._data, null, 2), 'utf8');
      } catch (err) {
        console.error(`[store] write failed for ${this.name}:`, err.message);
      }
    });
    return this._queue;
  }

  backup() {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dest  = path.join(BACKUP_DIR, `${this.name}-${stamp}.json`);
    try {
      fs.writeFileSync(dest, JSON.stringify(this._data, null, 2), 'utf8');
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith(`${this.name}-`))
        .sort();
      const { MAX_BACKUPS } = require('../config');
      files.slice(0, Math.max(0, files.length - MAX_BACKUPS))
           .forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
    } catch (err) {
      console.error(`[store] backup failed for ${this.name}:`, err.message);
    }
  }

  // ── reads ────────────────────────────────────────────────────────────────

  getAll()             { return this._data.filter(r => !r._deleted); }
  findById(id)         { return this._data.find(r => r.id === id && !r._deleted) || null; }
  findWhere(predicate) { return this.getAll().filter(predicate); }

  // ── writes ───────────────────────────────────────────────────────────────

  create(record) {
    this._data.push(record);
    this._flush();
    return record;
  }

  update(id, changes) {
    const idx = this._data.findIndex(r => r.id === id && !r._deleted);
    if (idx === -1) return null;
    this._data[idx] = { ...this._data[idx], ...changes, updatedAt: new Date().toISOString() };
    this._flush();
    return this._data[idx];
  }

  remove(id) {
    const idx = this._data.findIndex(r => r.id === id && !r._deleted);
    if (idx === -1) return false;
    this._data[idx]._deleted   = true;
    this._data[idx]._deletedAt = new Date().toISOString();
    this._flush();
    return true;
  }
}

module.exports = DataStore;
