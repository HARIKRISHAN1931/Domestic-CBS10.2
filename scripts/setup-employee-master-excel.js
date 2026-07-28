const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

const OUT = path.join(__dirname, '../src/modules/Administration/UserManagement/EmployeeMaster/data/employee-master.data.xlsx');

async function main() {
  const wb = new ExcelJS.Workbook();

  // ── Create ──────────────────────────────────────────────────────────────────
  // NATIVE selects  → use option VALUE attribute
  // SELECT2 widgets → use visible LABEL text
  const create = wb.addWorksheet('Create');
  create.addRow([
    'empId','userSalutation','empFName','empMName','empLName',
    'designation','joinDate','birthDate','gender','employmentType',
    'bloodGroup','education','religion','status',
    'dept','maritalStatus',
    'idProof','idNumber','issueDate','docIssuedBy','idProofName',
    'addrIdType','addrIdNo',
    'address1','address2','address3',
    'country','postalCode','email','isdMobile','mobile'
  ]);
  create.addRow([
    'EMP001',
    '1',                          // userSalutation NATIVE: 1=MR
    'Test','Kumar','Employee',
    'BANK BRANCH MANAGER',        // designation SELECT2 label
    '01-01-2020',                 // joinDate
    '15-06-1990',                 // birthDate
    '2',                          // gender NATIVE: 2=MALE
    '1',                          // employmentType NATIVE: 1=Permanent
    '1',                          // bloodGroup NATIVE: 1=A+
    '3',                          // education NATIVE: 3=GRADUATE
    '1',                          // religion NATIVE: 1=HINDU
    '1',                          // status NATIVE: 1=Active
    'INFORMATION TECHNOLOGY',     // dept SELECT2 label
    'UNMARRIED',                  // maritalStatus SELECT2 label
    '1',                          // idProof NATIVE: 1=AADHAR CARD
    '123456789012',
    '01-01-2020',                 // issueDate
    '8',                          // docIssuedBy NATIVE: 8=UIDAI
    'Test Employee',
    '1',                          // addrIdType NATIVE: 1=AADHAR CARD
    '123456789012',
    '123 Main Street','Near Park','Mumbai',
    'IND',                        // country NATIVE: IND=India
    '400001',
    'test.emp001@bank.com',
    '+91',                        // isdMobile NATIVE: +91
    '9876543210'
  ]);

  // ── Update ──────────────────────────────────────────────────────────────────
  const update = wb.addWorksheet('Update');
  update.addRow(['empId','empFName','email','mobile','address1']);
  update.addRow(['EMP001','Test Updated','test.emp001.upd@bank.com','9876543211','456 New Street']);

  // ── Authorize ────────────────────────────────────────────────────────────────
  const authorize = wb.addWorksheet('Authorize');
  authorize.addRow(['empId','empFName']);
  authorize.addRow(['EMP001','Test Employee']);

  // ── Negative ─────────────────────────────────────────────────────────────────
  const negative = wb.addWorksheet('Negative');
  negative.addRow(['empId','empFName']);
  negative.addRow(['EMP001','Test Employee']);

  // ── Database ─────────────────────────────────────────────────────────────────
  const database = wb.addWorksheet('Database');
  database.addRow(['empId','empFName']);
  database.addRow(['EMP001','Test']);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await wb.xlsx.writeFile(OUT);
  console.log('Created:', OUT);
}

main().catch(console.error);
