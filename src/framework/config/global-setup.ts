import * as fs   from 'fs';
import * as path from 'path';

export default async function globalSetup(): Promise<void> {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  const ts      = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const logFile = path.join(logsDir, `test-run-${ts}.log`);

  fs.writeFileSync(
    logFile,
    `=== CBS NG10X Test Run Started: ${new Date().toISOString()} ===\n`,
    { flag: 'a' }
  );

  // Make the log file path available to the logger via env
  process.env.CBS_LOG_FILE = logFile;
  console.log(`📋 Log file: ${logFile}`);
}
