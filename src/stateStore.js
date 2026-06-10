import fs from 'node:fs/promises';
import path from 'node:path';

export class StateStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async read() {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(content);
      return {
        lastPostId: parsed.lastPostId ? String(parsed.lastPostId) : null,
        updatedAt: parsed.updatedAt ?? null
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { lastPostId: null, updatedAt: null };
      }
      throw new Error(`Unable to read state file at ${this.filePath}: ${error.message}`);
    }
  }

  async writeLastPostId(lastPostId) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    const state = {
      lastPostId: String(lastPostId),
      updatedAt: new Date().toISOString()
    };
    const tempFile = `${this.filePath}.tmp`;

    await fs.writeFile(tempFile, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
    await fs.rename(tempFile, this.filePath);
    return state;
  }
}
