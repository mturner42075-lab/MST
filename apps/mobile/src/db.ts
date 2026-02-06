import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import type { SQLiteExecutor } from '@comic-catalog/repo/sqlite';
import { SQLiteRepository } from '@comic-catalog/repo/sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('comic-catalog.db');
  }
  return dbInstance;
}

const executor: SQLiteExecutor = {
  async execute(sql: string, params?: unknown[]): Promise<void> {
    const db = await getDb();
    await db.runAsync(sql, params as (string | number | null)[] ?? []);
  },

  async query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
    const db = await getDb();
    const result = await db.getAllAsync(sql, params as (string | number | null)[] ?? []);
    return result as T[];
  },

  async readFile(path: string): Promise<Uint8Array | null> {
    try {
      const base64 = await FileSystem.readAsStringAsync(path, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch {
      return null;
    }
  },

  async writeFile(path: string, data: Uint8Array): Promise<string> {
    const dir = path.substring(0, path.lastIndexOf('/'));
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});

    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    const base64 = btoa(binary);
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return path;
  },

  async deleteFile(path: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(path, { idempotent: true });
    } catch {
      // ignore
    }
  },

  async getAppDataDir(): Promise<string> {
    const dir = `${FileSystem.documentDirectory}comic-catalog`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
    return dir;
  },
};

let repoInstance: SQLiteRepository | null = null;

export async function getRepository(): Promise<SQLiteRepository> {
  if (!repoInstance) {
    repoInstance = new SQLiteRepository(executor);
    await repoInstance.initialize();
  }
  return repoInstance;
}
