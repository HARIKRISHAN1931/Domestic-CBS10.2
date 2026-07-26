import * as dotenv from 'dotenv';
import * as path from 'path';

const env = (process.env.ENV || 'qa').trim();
if (!['qa', 'uat'].includes(env)) throw new Error(`Invalid ENV: ${env}. Must be 'qa' or 'uat'`);
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
};

const optional = (key: string, fallback: string): string => process.env[key] ?? fallback;

export const config = {
  baseUrl: required('BASE_URL'),
  appPath: optional('CBS_APP_PATH', '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en'),
  logLevel: optional('LOG_LEVEL', 'info'),
  auth: {
    username:        required('MAKER_USERNAME'),
    password:        required('MAKER_PASSWORD'),
    checkerUsername: required('CHECKER_USERNAME'),
    checkerPassword: required('CHECKER_PASSWORD'),
  },
  db: {
    host:     optional('DB_HOST', ''),
    port:     Number(optional('DB_PORT', '1433')),
    name:     optional('DB_NAME', ''),
    user:     optional('DB_USER', ''),
    password: optional('DB_PASSWORD', ''),
  },
} as const;
