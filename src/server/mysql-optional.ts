/* mysql2 is intentionally loaded only when DATABASE_URL exists. This keeps the local demo usable before dependencies are installed. */
import { createRequire } from 'node:module';
export type RowDataPacket = Record<string, unknown>;
export type Pool = { query<T extends RowDataPacket[]>(sql: string, params?: unknown[]): Promise<[T, unknown]> };
export function createPool(url: string): Pool {
  try {
    const require = createRequire(`${process.cwd()}/package.json`);
    const driver = require(['mysql2', 'promise'].join('/')) as { createPool: (connectionString: string) => Pool };
    return driver.createPool(url);
  } catch {
    throw new Error('Install mysql2 before enabling DATABASE_URL.');
  }
}
