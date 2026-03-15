import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const TEMP_PREFIX = 'skillsy-';

export async function downloadFile(url, customFilename = null) {
  const tempDir = path.join(os.tmpdir(), 'skillsy-download');
  await fs.ensureDir(tempDir);

  const filename = customFilename || path.basename(new URL(url).pathname) || 'archive.zip';
  const filepath = path.join(tempDir, filename);

  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
    timeout: 60000 // 1 minute timeout
  });

  const writer = fs.createWriteStream(filepath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filepath));
    writer.on('error', reject);
  });
}

export async function cleanupTemp() {
  const tempDir = path.join(os.tmpdir(), 'skillsy-download');
  await fs.remove(tempDir);
}

export function getTempDir() {
  return path.join(os.tmpdir(), 'skillsy-extract');
}
