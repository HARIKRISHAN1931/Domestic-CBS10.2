const ExcelJS = require('exceljs');
const path    = require('path');

const OUT = path.resolve(__dirname, '..', 'src/modules/Administration/UserManagement/UserMaster/data/user-master.data.xlsx');

const CREATE_COLS = [
  'loginId','employeeId','roleCode','userBaseBranchCode',
  'userSalutation','userFName','userMName','userLName','userDisplayName',
  'userTypeCode','preferLang','mobileNo1','emailId','hnwCategory',
  'mulBranchAcccess','allowConcurrentLogin','forcePwdChg'
];

const NOTES = {
  loginId:              'MANDATORY unique max=10 — same as empId',
  employeeId:           'MANDATORY — empId from EmployeeMaster (F2 lookup)',
  roleCode:             'MANDATORY — F2 lookup: 1=Infraadmin, use role name text',
  userBaseBranchCode:   'MANDATORY — branch code e.g. 100 (F2 lookup)',
  userSalutation:       '1=MR 2=MRS 3=MISS 9=SHRI 10=SMT',
  userFName:            'MANDATORY max=60',
  userMName:            'Optional max=60',
  userLName:            'MANDATORY max=60',
  userDisplayName:      'MANDATORY max=60',
  userTypeCode:         'INTERNAL | EXTERNAL | WEBUSER',
  preferLang:           '1=English',
  mobileNo1:            '10 digits',
  emailId:              'MANDATORY valid email max=100',
  hnwCategory:          '1=VIP 2=PRIVILEGED 3=NORMAL',
  mulBranchAcccess:     'Y or N',
  allowConcurrentLogin: 'Y or N',
  forcePwdChg:          'Y or N',
};

// 42 branches 100-141, 2 roles each
const BRANCH_NAMES = [
  'HeadOffice','Burdwan','Memari','Chaitanya','Guskara',
  'Seharabazar','Asansol','CityCentre','Katwa','Kalna',
  'BranchTen','BranchEleven','BranchTwelve','BranchThirteen','BranchFourteen',
  'BranchFifteen','BranchSixteen','BranchSeventeen','BranchEighteen','BranchNineteen',
  'BranchTwenty','BranchTwentyone','BranchTwentytwo','BranchTwentythree','BranchTwentyfour',
  'BranchTwentyfive','BranchTwentysix','BranchTwentyseven','BranchTwentyeight','BranchTwentynine',
  'BranchThirty','BranchThirtyone','BranchThirtytwo','BranchThirtythree','BranchThirtyfour',
  'BranchThirtyfive','BranchThirtysix','BranchThirtyseven','BranchThirtyeight','BranchThirtynine',
  'BranchForty','BranchFortyOne'
];

const BRANCHES = Array.from({ length: 42 }, (_, i) => ({
  code: String(100 + i),
  name: BRANCH_NAMES[i],
}));

// roleCode: use text that F2 lookup will search for
// CLERK → 'CLERK' role, MGR → 'MANAGER' role (F2 picks first match)
const CREATE_ROWS = BRANCHES.flatMap(({ code, name }, i) => [
  // CLERK
  {
    loginId:              `CLERK${code}`,
    employeeId:           `CLERK${code}`,
    roleCode:             '1',
    userBaseBranchCode:   code,
    userSalutation:       '1',
    userFName:            'Clerk',
    userMName:            '',
    userLName:            name,
    userDisplayName:      `CLK${code}`,
    userTypeCode:         'INTERNAL',
    preferLang:           '1',
    mobileNo1:            `9${code}1${String(i).padStart(5,'0')}`,
    emailId:              `clerk${code}@bank.com`,
    hnwCategory:          '3',
    mulBranchAcccess:     'Y',
    allowConcurrentLogin: 'N',
    forcePwdChg:          'Y',
  },
  // MGR
  {
    loginId:              `MGR${code}`,
    employeeId:           `MGR${code}`,
    roleCode:             '1',
    userBaseBranchCode:   code,
    userSalutation:       '1',
    userFName:            'Manager',
    userMName:            '',
    userLName:            name,
    userDisplayName:      `MGR${code}`,
    userTypeCode:         'INTERNAL',
    preferLang:           '1',
    mobileNo1:            `9${code}2${String(i).padStart(5,'0')}`,
    emailId:              `mgr${code}@bank.com`,
    hnwCategory:          '3',
    mulBranchAcccess:     'Y',
    allowConcurrentLogin: 'N',
    forcePwdChg:          'Y',
  },
]);

const AUTH_COLS = ['loginId','action','remark'];
const AUTH_ROWS = CREATE_ROWS.map(r => ({ loginId: r.loginId, action: 'APPROVE', remark: '' }));

async function build() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'CBS Automation Framework';
  wb.created = new Date();

  const H_FILL = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1F4E79' } };
  const H_FONT = { bold:true, color:{ argb:'FFFFFFFF' }, size:10 };
  const N_FILL = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFFF2CC' } };
  const N_FONT = { italic:true, color:{ argb:'FF7F6000' }, size:9 };
  const A_FILL = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFD9E1F2' } };

  const addSheet = (name, cols, rows, notes) => {
    const ws = wb.addWorksheet(name);
    ws.addRow(cols);
    const hRow = ws.getRow(1);
    hRow.eachCell(c => { c.fill = H_FILL; c.font = H_FONT; c.alignment = { horizontal:'center', vertical:'middle', wrapText:true }; });
    hRow.height = 30;
    if (notes) {
      ws.addRow(cols.map(c => notes[c] || ''));
      const nRow = ws.getRow(2);
      nRow.eachCell(c => { c.fill = N_FILL; c.font = N_FONT; c.alignment = { wrapText:true }; });
      nRow.height = 40;
    }
    rows.forEach((row, i) => {
      ws.addRow(cols.map(c => row[c] !== undefined ? row[c] : ''));
      const dRow = ws.getRow(notes ? i + 3 : i + 2);
      if (i % 2 === 1) dRow.eachCell(c => { c.fill = A_FILL; });
      dRow.height = 20;
    });
    cols.forEach((col, i) => {
      const maxLen = Math.max(col.length, ...rows.map(r => String(r[col] || '').length));
      ws.getColumn(i + 1).width = Math.min(Math.max(maxLen + 2, 12), 40);
    });
    ws.views = [{ state:'frozen', ySplit: notes ? 2 : 1 }];
  };

  addSheet('Create',    CREATE_COLS, CREATE_ROWS, NOTES);
  addSheet('Authorize', AUTH_COLS,   AUTH_ROWS,   null);

  await wb.xlsx.writeFile(OUT);
  console.log('Excel written:', OUT);
  console.log('Create:', CREATE_COLS.length, 'cols,', CREATE_ROWS.length, 'rows (', CREATE_ROWS.length / 2, 'branches × 2 roles)');
}

build().catch(console.error);
