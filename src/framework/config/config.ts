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

// Build branch user map: branchCode → { clerk, mgr }
const BRANCH_NAMES: Record<string, string> = {
  '100': 'HeadOffice',    '101': 'Burdwan',         '102': 'Memari',
  '103': 'Chaitanya',     '104': 'Guskara',          '105': 'Seharabazar',
  '106': 'Asansol',       '107': 'CityCentre',       '108': 'Katwa',
  '109': 'Kalna',         '110': 'BranchTen',        '111': 'BranchEleven',
  '112': 'BranchTwelve',  '113': 'BranchThirteen',   '114': 'BranchFourteen',
  '115': 'BranchFifteen', '116': 'BranchSixteen',    '117': 'BranchSeventeen',
  '118': 'BranchEighteen','119': 'BranchNineteen',   '120': 'BranchTwenty',
  '121': 'BranchTwentyone','122': 'BranchTwentytwo', '123': 'BranchTwentythree',
  '124': 'BranchTwentyfour','125': 'BranchTwentyfive','126': 'BranchTwentysix',
  '127': 'BranchTwentyseven','128': 'BranchTwentyeight','129': 'BranchTwentynine',
  '130': 'BranchThirty',  '131': 'BranchThirtyone',  '132': 'BranchThirtytwo',
  '133': 'BranchThirtythree','134': 'BranchThirtyfour','135': 'BranchThirtyfive',
  '136': 'BranchThirtysix','137': 'BranchThirtyseven','138': 'BranchThirtyeight',
  '139': 'BranchThirtynine','140': 'BranchForty',    '141': 'BranchFortyOne',
};

export interface BranchUsers {
  branchCode:   string;
  branchName:   string;
  clerkUsername: string;
  clerkPassword: string;
  mgrUsername:   string;
  mgrPassword:   string;
}

const branchUsers: BranchUsers[] = Object.keys(BRANCH_NAMES).map(code => ({
  branchCode:    code,
  branchName:    BRANCH_NAMES[code],
  clerkUsername: optional(`CLERK${code}_USERNAME`, `CLERK${code}`),
  clerkPassword: optional(`CLERK${code}_PASSWORD`, optional('USER_PASSWORD', 'Abcd@1243')),
  mgrUsername:   optional(`MGR${code}_USERNAME`,   `MGR${code}`),
  mgrPassword:   optional(`MGR${code}_PASSWORD`,   optional('USER_PASSWORD', 'Abcd@1243')),
}));

export const config = {
  baseUrl: required('BASE_URL'),
  appPath: optional('CBS_APP_PATH', '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en'),
  logLevel: optional('LOG_LEVEL', 'info'),
  auth: {
    username:        required('MAKER_USERNAME'),
    password:        required('MAKER_PASSWORD'),
    checkerUsername: required('CHECKER_USERNAME'),
    checkerPassword: required('CHECKER_PASSWORD'),
    userPassword:    optional('USER_PASSWORD', 'Abcd@1243'),
  },
  branchUsers,
  db: {
    host:     optional('DB_HOST', ''),
    port:     Number(optional('DB_PORT', '1433')),
    name:     optional('DB_NAME', ''),
    user:     optional('DB_USER', ''),
    password: optional('DB_PASSWORD', ''),
  },
} as const;
