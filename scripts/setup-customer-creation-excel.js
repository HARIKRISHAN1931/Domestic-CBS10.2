const ExcelJS = require('exceljs');
const path    = require('path');

const FILE = path.join(__dirname, '../src/modules/Masters/CustomerManagement/CustomerCreationretail/data/customer-creation.data.xlsx');

async function main() {
  const wb = new ExcelJS.Workbook();

  // ── Create sheet ──────────────────────────────────────────────────────────
  const create = wb.addWorksheet('Create');
  create.addRow([
    // Tab 1: Basic Details
    'customerCategory','customerType','customerBranch','AMLRating','memRole',
    'nameTitle','memberFName','memberMName','memberLName',
    'motherFname','motherMname','motherLname',
    'spouseFname','spouseMname','spouseLname',
    'memberDOB','memberGender','nationality','mbrMaritalStatus','residentialStatus',
    'residentYn','docProof','idType','pan','form60Yn','disabilityYn','memberMonthlyInc',
    // Tab 2: Contact Details
    'addressType','address1','address2','address3',
    'countryCode','stateCode','districtCode','area',
    'ruralUrban','pinCode','mobileNo1','emailId','ownership',
    // Tab 3: Additional Details
    'KYCAvailableYn','pepYn','occupation','occupationType',
    'religion','bloodGroup','qualification',
    'annualTurnover','NPARating',
    // Tab 4: Document Details
    'proofType','docType','idNumber','issuedDate','expiryDate',
    'nameAsInDocument','issuedByCountry',
  ]);
  create.addRow([
    // Tab 1
    '1','1','','','',
    '1','ISHAN','','SRI',
    '','','',
    '','','',
    '01-01-1999','1','1','1','1',
    'Y','','','','N','N','',
    // Tab 2
    '1','123 Test Street','Near Park','',
    '1','1','1','',
    '1','500001','9876543210','test@example.com','1',
    // Tab 3
    'Y','N','1','',
    '','','',
    '','',
    // Tab 4
    '2','','TEST123','','',
    'ISHAN SRI','1',
  ]);

  // ── Auth sheet ────────────────────────────────────────────────────────────
  const auth = wb.addWorksheet('Auth');
  auth.addRow(['searchKey', 'tab']);
  auth.addRow(['ISHAN', 'pending']);

  // ── Update sheet ──────────────────────────────────────────────────────────
  const update = wb.addWorksheet('Update');
  update.addRow([
    'searchKey','tab',
    'customerCategory','memberFName','memberLName','memberDOB',
    'mobileNo1','emailId',
  ]);
  update.addRow([
    '','authorized',
    '1','ISHAN','SRI','01-01-1999',
    '9876543211','updated@example.com',
  ]);

  // ── Database sheet ────────────────────────────────────────────────────────
  const database = wb.addWorksheet('Database');
  database.addRow(['custNo']);
  database.addRow(['']);   // filled at runtime from SharedDataStore

  // ── Negative sheet ────────────────────────────────────────────────────────
  const negative = wb.addWorksheet('Negative');
  negative.addRow(['scenario']);
  negative.addRow(['empty_mandatory_fields']);

  await wb.xlsx.writeFile(FILE);
  console.log('✅  customer-creation.data.xlsx written with Create/Auth/Update/Database/Negative sheets');
}

main().catch(console.error);
