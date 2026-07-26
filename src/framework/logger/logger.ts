import { test } from '@playwright/test';
import * as fs   from 'fs';
import * as path from 'path';

type LogLevel    = 'INFO' | 'OK' | 'ERR' | 'WARN' | 'DB' | 'UI' | 'STEP';
type PublicLevel = 'info' | 'pass' | 'fail' | 'warn' | 'db' | 'ui';

const EMOJI: Record<LogLevel, string> = {
  INFO: 'ℹ️ ', OK: '✅', ERR: '❌', WARN: '⚠️ ', DB: '🗄️ ', UI: '🖥️ ', STEP: '▶️ ',
};

const LEVEL_MAP: Record<PublicLevel, LogLevel> = {
  info: 'INFO', pass: 'OK', fail: 'ERR', warn: 'WARN', db: 'DB', ui: 'UI',
};

// ── Log file setup ────────────────────────────────────────────────────────────
const LOGS_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

const RUN_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const LOG_FILE      = process.env.CBS_LOG_FILE
  ?? path.join(LOGS_DIR, `test-run-${RUN_TIMESTAMP}.log`);
const logStream     = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function clean(value: string): string {
  return value.replace(/[\r\n\t]/g, ' ').trim();
}

function emit(level: LogLevel, message: string, detail?: unknown): void {
  const ts    = new Date().toISOString().slice(11, 23);
  const msg   = clean(message);
  const extra = detail !== undefined ? ` | ${clean(JSON.stringify(detail))}` : '';
  const line  = `[${ts}] ${EMOJI[level]} [${level}] ${msg}${extra}\n`;

  // Write to console
  process.stdout.write(line);

  // Write to log file (strip emoji for clean file output)
  const fileLine = `[${new Date().toISOString()}] [${level}] ${msg}${extra}\n`;
  logStream.write(fileLine);
}

export const logger = {
  info:  (msg: string, detail?: unknown) => emit(LEVEL_MAP.info, msg, detail),
  pass:  (msg: string, detail?: unknown) => emit(LEVEL_MAP.pass, msg, detail),
  fail:  (msg: string, detail?: unknown) => emit(LEVEL_MAP.fail, msg, detail),
  warn:  (msg: string, detail?: unknown) => emit(LEVEL_MAP.warn, msg, detail),
  db:    (msg: string, detail?: unknown) => emit(LEVEL_MAP.db,   msg, detail),
  ui:    (msg: string, detail?: unknown) => emit(LEVEL_MAP.ui,   msg, detail),

  step: async (name: string, fn: () => Promise<void>) => {
    emit('STEP', name);
    await test.step(name, fn);
  },

  /** Returns the path of the current log file */
  getLogFile: () => LOG_FILE,

  diffReport(
    label: string,
    uiValues: Record<string, string>,
    dbRecord: Record<string, unknown>,
    fieldMap: Record<string, string>
  ): string[] {
    const diffs: string[] = [];
    for (const [uiKey, dbCol] of Object.entries(fieldMap)) {
      const uiVal = (uiValues[uiKey] ?? '').toString().trim();
      const dbVal = (dbRecord[dbCol]  ?? '').toString().trim();
      if (uiVal !== dbVal) diffs.push(`${uiKey}: UI=[${uiVal}] DB=[${dbVal}]`);
    }
    diffs.length > 0
      ? emit('ERR', `[${label}] mismatches: ${diffs.join(' | ')}`)
      : emit('DB',  `[${label}] all fields match DB`);
    return diffs;
  },
};
