const fs = require('node:fs');
const path = require('node:path');
const storageKeys = require('./storage-keys.json');

const keySet = new Set(storageKeys);

const sanitiseStorageSnapshot = value => {
  if (!value || typeof value !== 'object' || value.version !== 1 || !value.values || typeof value.values !== 'object') return null;
  const values = {};
  for (const [key, entry] of Object.entries(value.values)) {
    if (keySet.has(key) && typeof entry === 'string' && entry.length <= 5_000_000) values[key] = entry;
  }
  return { version: 1, exportedAt: Number.isFinite(value.exportedAt) ? value.exportedAt : Date.now(), values };
};

const readStorageSnapshot = filePath => {
  try { return sanitiseStorageSnapshot(JSON.parse(fs.readFileSync(filePath, 'utf8'))); } catch { return null; }
};

const writeStorageSnapshot = (filePath, value) => {
  const snapshot = sanitiseStorageSnapshot(value);
  if (!snapshot) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(snapshot, null, 2), 'utf8');
  fs.renameSync(temporaryPath, filePath);
  return true;
};

module.exports = { readStorageSnapshot, sanitiseStorageSnapshot, storageKeys, writeStorageSnapshot };
