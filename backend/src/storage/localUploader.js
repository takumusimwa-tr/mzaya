const fs = require('fs/promises');
const path = require('path');

const uploadRoot = path.resolve(
  process.env.LOCAL_UPLOAD_ROOT || './var/uploads'
);

function resolveKey(key) {
  const target = path.resolve(uploadRoot, key);
  if (!target.startsWith(uploadRoot)) {
    throw new Error('Unsafe storage key');
  }
  return target;
}

async function ensureParent(filepath) {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
}

async function putBuffer({ key, buffer }) {
  const filepath = resolveKey(key);
  await ensureParent(filepath);
  await fs.writeFile(filepath, buffer);
  return { key, byteSize: buffer.length };
}

async function removeObject(key) {
  await fs.rm(resolveKey(key), { force: true });
}

async function objectExists(key) {
  try {
    await fs.access(resolveKey(key));
    return true;
  } catch {
    return false;
  }
}

async function createReadUrl(key) {
  return `/api/attachments/content/${encodeURIComponent(key)}`;
}

module.exports = {
  putBuffer,
  removeObject,
  objectExists,
  createReadUrl,
};
