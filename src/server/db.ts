import { createPool, type Pool, type RowDataPacket } from './mysql-optional';

let pool: Pool | null | undefined;
export function getPool() {
  if (pool !== undefined) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) return (pool = null);
  try {
    pool = createPool(url);
  } catch {
    pool = null;
  }
  return pool;
}
export function hasDatabase() { return Boolean(getPool()); }
export async function query<T extends RowDataPacket[] = RowDataPacket[]>(sql: string, params: unknown[] = []) {
  const connection = getPool();
  if (!connection) throw new Error('DATABASE_URL is not configured.');
  const [rows] = await connection.query<T>(sql, params);
  return rows;
}
