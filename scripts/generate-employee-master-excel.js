const ExcelJS = require('exceljs');
const path    = require('path');

const OUT = path.resolve(__dirname, '..', 'src/modules/Administration/UserManagement/EmployeeMaster/data/employee-master.data.xlsx');

// ── Column definitions matching EmployeeMasterData interface ─────────────────
// Columns confirmed from live CBS app capture
const CREATE_COLS = [
  'empId','userSalutation','empFName','empMName','empLName',
  'designation','joinDate','birthDate',
  'employmentType','bloodGroup','education',
  'religion','caste',
  'status','retireDate','remark',
  'postBr','dept','repoMngr','maritalStatus','empSpouseName',
  'idProof','idNumber','issueDate','docIssuedBy','idProofName',
  'addrIdType','addrIdNo','address1','address2','address3',
  'country','state','city','postalCode',
  'email','isdMobile','mobile','officeTelephone',
  'docUpload','docUpload1'
];

// Notes column for documentation
const NOTES = {
  empId:           'Unique, max 10 chars',
  userSalutation:  '1=MR 2=MRS 3=MISS 6=THE 7=KUMARI 8=MAST 9=SHRI 10=SMT 11=MX',
  empFName:        'MANDATORY max 60',
  empMName:        'Optional max 60',
  empLName:        'MANDATORY max 60',
  designation:     'Select2 — exact text e.g. "1 -BANK BRANCH MANAGER"',
  joinDate:        'dd-MM-yyyy MANDATORY',
  birthDate:       'dd-MM-yyyy MANDATORY',
  employmentType:  '1=Permanent 2=Retainer 3=Contract',
  bloodGroup:      '1=A+ 2=B+ 3=A- 4=B- 5=O+ 6=O- 7=AB+ 8=AB-',
  education:       '1=SSC 2=HSC 3=GRADUATE 4=POST GRADUATE 5=LTI 7=OTHERS',
  religion:        '1=HINDU 2=MUSLIM 3=Christian 4=Sikh 5=Buddhist 6=Jain',
  caste:           'Dependent on religion — loads after religion selected',
  status:          '1=Active 2=Suspended 3=Retired 4=Transferred (always disabled, force-set)',
  retireDate:      'dd-MM-yyyy — required when status=Retired',
  remark:          'Optional remarks',
  postBr:          'F2 lookup — enter branch code e.g. 101 MANDATORY',
  dept:            'Select2 — exact text e.g. "1-CORPORATE" MANDATORY',
  repoMngr:        'F2 lookup — enter user ID e.g. demo1',
  maritalStatus:   'Select2 — exact text e.g. "1-UNMARRIED" MANDATORY',
  empSpouseName:   'Visible only when maritalStatus=MARRIED',
  idProof:         '1=AADHAR 2=Voters 3=PAN 4=PASSPORT 5=DRIVING MANDATORY',
  idNumber:        '12 digits for AADHAR MANDATORY',
  issueDate:       'dd-MM-yyyy MANDATORY',
  docIssuedBy:     '1=SOCIAL SECURITY 2=INCOME TAX 3=ELECTION COMM 8=UIDAI MANDATORY',
  idProofName:     'Name as per ID proof MANDATORY',
  addrIdType:      '1=AADHAR 2=Voters 3=PAN 4=PASSPORT 11=ELECTRICITY BILL MANDATORY',
  addrIdNo:        '12 digits for AADHAR MANDATORY',
  address1:        'Address Line 1 MANDATORY',
  address2:        'Address Line 2',
  address3:        'Address Line 3',
  country:         'IND=India MANDATORY',
  state:           'Select2 text search e.g. "WEST BENGAL" MANDATORY',
  city:            'Numeric value e.g. 306=PURBA BARDHAMAN MANDATORY',
  postalCode:      '6 digits MANDATORY',
  email:           'Valid email MANDATORY',
  isdMobile:       '+91 MANDATORY',
  mobile:          '10 digits MANDATORY unique',
  officeTelephone: 'Optional office phone',
  docUpload:       'Path to image file — Upload Document MANDATORY',
  docUpload1:      'Path to image file — Upload Address Proof MANDATORY',
};

// ── Create data rows — 2 employees per branch (Clerk + Manager) × 10 branches ─
const DOC_PATH = './test-doc.png';

// 42 CBS branches (100–141) with alpha-only names for empLName
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
const BRANCHES = Array.from({ length: 42 }, (_, i) => ({ code: String(100 + i), name: BRANCH_NAMES[i] }));

// mobile: 9 + branchCode(3) + role digit(1) + 5-digit idx = 10 digits
// idNumber/addrIdNo: role digit(1) + branchCode(3) + 8-digit idx = 12 digits
const CREATE_ROWS = BRANCHES.flatMap(({ code, name }, i) => [
  // Clerk
  {
    empId:`CLERK${code}`, userSalutation:'1', empFName:'Clerk', empMName:'', empLName:name,
    designation:'2 -BANK BRANCH CLERK', joinDate:'01-01-2020', birthDate:'15-06-1990',
    employmentType:'1', bloodGroup:'1', education:'3',
    religion:'1', caste:'1',
    status:'1', retireDate:'', remark:`Clerk for branch ${code}`,
    postBr:code, dept:'1-CORPORATE', repoMngr:'demo1', maritalStatus:'1-UNMARRIED', empSpouseName:'',
    idProof:'1', idNumber:`9${code}1${String(i).padStart(7,'0')}`, issueDate:'01-01-2020', docIssuedBy:'8', idProofName:`Clerk ${name}`,
    addrIdType:'1', addrIdNo:`9${code}1${String(i).padStart(7,'0')}`, address1:`${name} Branch Street`, address2:'', address3:'',
    country:'IND', state:'WEST BENGAL', city:'306', postalCode:'700001',
    email:`clerk${code}@bank.com`, isdMobile:'+91', mobile:`9${code}1${String(i).padStart(5,'0')}`, officeTelephone:'',
    docUpload:DOC_PATH, docUpload1:DOC_PATH,
  },
  // Manager
  {
    empId:`MGR${code}`, userSalutation:'1', empFName:'Manager', empMName:'', empLName:name,
    designation:'1 -BANK BRANCH MANAGER', joinDate:'01-01-2018', birthDate:'10-03-1985',
    employmentType:'1', bloodGroup:'1', education:'4',
    religion:'1', caste:'1',
    status:'1', retireDate:'', remark:`Manager for branch ${code}`,
    postBr:code, dept:'1-CORPORATE', repoMngr:'demo1', maritalStatus:'1-UNMARRIED', empSpouseName:'',
    idProof:'1', idNumber:`9${code}2${String(i).padStart(7,'0')}`, issueDate:'01-01-2018', docIssuedBy:'8', idProofName:`Manager ${name}`,
    addrIdType:'1', addrIdNo:`9${code}2${String(i).padStart(7,'0')}`, address1:`${name} Branch Street`, address2:'', address3:'',
    country:'IND', state:'WEST BENGAL', city:'306', postalCode:'700001',
    email:`mgr${code}@bank.com`, isdMobile:'+91', mobile:`9${code}2${String(i).padStart(5,'0')}`, officeTelephone:'',
    docUpload:DOC_PATH, docUpload1:DOC_PATH,
  },
]);

const UPDATE_COLS = ['empId','empFName','empMName','empLName','email','mobile','address1','address2','remark'];
const UPDATE_ROWS = [
  { empId:'EMPC101', empFName:'Test1 Updated', empMName:'Kumar', empLName:'Employee Updated',
    email:'test.emp101.upd@bank.com', mobile:'9876543220', address1:'456 New Street', address2:'Updated Area', remark:'Updated record' },
];

const AUTH_COLS = ['empId','empFName','action','remark'];
const AUTH_ROWS = [
  { empId:'EMPC101', empFName:'Test1', action:'APPROVE', remark:'' },
  { empId:'EMPC102', empFName:'Priya', action:'APPROVE', remark:'' },
  { empId:'EMPC103', empFName:'Retainer', action:'REJECT', remark:'Incomplete documents' },
];

const NEG_COLS = ['empId','empFName','joinDate','mobile','email','expectedError'];
const NEG_ROWS = [
  { empId:'', empFName:'Test', joinDate:'01-01-2025', mobile:'9876543210', email:'test@bank.com', expectedError:'Employee ID is required' },
  { empId:'NEGTEST01', empFName:'', joinDate:'01-01-2025', mobile:'9876543210', email:'test@bank.com', expectedError:'First Name is required' },
  { empId:'NEGTEST02', empFName:'Test', joinDate:'', mobile:'9876543210', email:'test@bank.com', expectedError:'Join Date is required' },
  { empId:'NEGTEST03', empFName:'Test', joinDate:'01-01-2025', mobile:'123', email:'test@bank.com', expectedError:'Invalid mobile number' },
  { empId:'NEGTEST04', empFName:'Test', joinDate:'01-01-2025', mobile:'9876543210', email:'invalid-email', expectedError:'Invalid email format' },
];

const DB_COLS = ['empId','expectedEmpFName','expectedAuthStatus','expectedIsActive','expectedDept','expectedMobile'];
const DB_ROWS = [
  { empId:'EMPC101', expectedEmpFName:'Test1', expectedAuthStatus:'U', expectedIsActive:'1', expectedDept:'CORPORATE', expectedMobile:'9876543210' },
  { empId:'EMPC102', expectedEmpFName:'Priya', expectedAuthStatus:'U', expectedIsActive:'1', expectedDept:'HUMAN RESOURCES', expectedMobile:'9876543211' },
];

// ── Build workbook ────────────────────────────────────────────────────────────
async function build() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'CBS Automation Framework';
  wb.created = new Date();

  const HEADER_FILL = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1F4E79' } };
  const HEADER_FONT = { bold:true, color:{ argb:'FFFFFFFF' }, size:10 };
  const NOTE_FILL   = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFFF2CC' } };
  const NOTE_FONT   = { italic:true, color:{ argb:'FF7F6000' }, size:9 };
  const ALT_FILL    = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFD9E1F2' } };

  function addSheet(name, cols, rows, notes) {
    const ws = wb.addWorksheet(name);

    // Header row
    ws.addRow(cols);
    const hRow = ws.getRow(1);
    hRow.eachCell(c => { c.fill = HEADER_FILL; c.font = HEADER_FONT; c.alignment = { horizontal:'center', vertical:'middle', wrapText:true }; });
    hRow.height = 30;

    // Notes row (row 2)
    if (notes) {
      const noteVals = cols.map(c => notes[c] || '');
      ws.addRow(noteVals);
      const nRow = ws.getRow(2);
      nRow.eachCell(c => { c.fill = NOTE_FILL; c.font = NOTE_FONT; c.alignment = { wrapText:true }; });
      nRow.height = 40;
    }

    // Data rows
    rows.forEach((row, i) => {
      const vals = cols.map(c => row[c] !== undefined ? row[c] : '');
      ws.addRow(vals);
      const dRow = ws.getRow(notes ? i + 3 : i + 2);
      if (i % 2 === 1) dRow.eachCell(c => { c.fill = ALT_FILL; });
      dRow.height = 20;
    });

    // Column widths
    cols.forEach((col, i) => {
      const maxLen = Math.max(col.length, ...rows.map(r => String(r[col] || '').length));
      ws.getColumn(i + 1).width = Math.min(Math.max(maxLen + 2, 12), 40);
    });

    // Freeze header
    ws.views = [{ state:'frozen', ySplit: notes ? 2 : 1 }];
    return ws;
  }

  addSheet('Create',    CREATE_COLS, CREATE_ROWS, NOTES);
  addSheet('Update',    UPDATE_COLS, UPDATE_ROWS, null);
  addSheet('Authorize', AUTH_COLS,   AUTH_ROWS,   null);
  addSheet('Negative',  NEG_COLS,    NEG_ROWS,    null);
  addSheet('Database',  DB_COLS,     DB_ROWS,     null);

  await wb.xlsx.writeFile(OUT);
  console.log('Excel written:', OUT);

  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log('Create sheet columns  :', CREATE_COLS.length, 'columns,', CREATE_ROWS.length, 'data rows (', CREATE_ROWS.length/2, 'branches × 2 roles)');
  console.log('Update sheet columns  :', UPDATE_COLS.length, 'columns,', UPDATE_ROWS.length, 'data rows');
  console.log('Authorize sheet cols  :', AUTH_COLS.length, 'columns,', AUTH_ROWS.length, 'data rows');
  console.log('Negative sheet cols   :', NEG_COLS.length, 'columns,', NEG_ROWS.length, 'data rows');
  console.log('Database sheet cols   :', DB_COLS.length, 'columns,', DB_ROWS.length, 'data rows');

  console.log('\n=== COLUMNS ADDED vs OLD EXCEL ===');
  const oldCols = ['empId','userSalutation','empFName','empMName','empLName','designation','joinDate','birthDate','gender','employmentType','bloodGroup','education','religion','status','dept','maritalStatus','idProof','idNumber','issueDate','docIssuedBy','idProofName','addrIdType','addrIdNo','address1','address2','address3','country','postalCode','email','isdMobile','mobile'];
  const added = CREATE_COLS.filter(c => !oldCols.includes(c));
  const removed = oldCols.filter(c => !CREATE_COLS.includes(c));
  console.log('Added   :', added.join(', '));
  console.log('Removed :', removed.join(', '));
}

build().catch(console.error);
