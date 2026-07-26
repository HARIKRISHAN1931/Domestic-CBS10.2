import * as sql from 'mssql';
import { config } from '../config/config';
import { logger } from '../logger/logger';

export class DatabaseConnectionManager {
  private pool: sql.ConnectionPool | null = null;

  async connect(): Promise<void> {
    if (this.pool?.connected) return;
    const sqlConfig: sql.config = {
      server: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      options: { encrypt: true, trustServerCertificate: true },
      pool: { max: 10, min: 0, idleTimeoutMillis: 30_000 },
    };
    logger.info(`Connecting to database: ${config.db.host}/${config.db.name}`);
    this.pool = await sql.connect(sqlConfig);
    logger.info('Database connection established');
  }

  async query<T>(queryText: string, params?: Record<string, unknown>): Promise<T[]> {
    await this.connect();
    const req = this.pool!.request();
    if (params) Object.entries(params).forEach(([k, v]) => req.input(k, v));
    const result = await req.query(queryText);
    return result.recordset as T[];
  }

  async execute(queryText: string, params?: Record<string, unknown>): Promise<void> {
    await this.connect();
    const req = this.pool!.request();
    if (params) Object.entries(params).forEach(([k, v]) => req.input(k, v));
    await req.query(queryText);
  }

  async disconnect(): Promise<void> {
    if (this.pool?.connected) {
      await this.pool.close();
      logger.info('Database connection closed');
    }
  }
}
