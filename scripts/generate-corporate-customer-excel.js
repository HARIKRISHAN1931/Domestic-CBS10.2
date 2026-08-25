const ExcelJS = require('exceljs');
const path    = require('path');

const OUT = path.resolve(__dirname, '..', 'src/modules/Customer/Corporate/CorporateCustomer/data/corporate-customer.data.xlsx');

const RUN = Date.now().toString().slice(-6);

const CREATE_COLS = [
  'customerCategory','memberFName','shortName','dateOfEstablishment','registrationNo',
  'commencementDate','taxResidenceStatus','pan','tinAvailable','taxIdNo',
  'gstNo','gstRegDate','annualTurnover','noOfEmployees','sizeOfFirm','custReason',
  'addressType','address1','address2','address3','pinCode',
  'countryCode','stateCode','districtCode',
  'mobile1CountryCode','mobileNo1','emailId','contactPerson','website',
  'proofType','idNumber','issuedDate','expiryDate',
  'nameAsInDocument','recievedDate','issuedBy',
  'tdsAvailable','specialInstruct1','specialInstruct2'
];

const NOTES = {
  customerCategory:    'Select2: 501-SOCIETY|502-GOVERNMENT|503-COMPANY|504-PARTNERSHIP FIRM|505-TRUST|509-SOLE PROPRIETOR',
  memberFName:         'Company/Entity Name MANDATORY maxl=100',
  shortName:           'Short Name maxl=50',
  dateOfEstablishment: 'dd-MM-yyyy',
  registrationNo:      'Registration No maxl=30',
  commencementDate:    'dd-MM-yyyy',
  taxResidenceStatus:  '1=RESIDENT 2=NRI',
  pan:                 'PAN maxl=10',
  tinAvailable:        'Y or N',
  taxIdNo:             'Tax ID maxl=20 (enabled when tinAvailable=Y)',
  gstNo:               'GST No maxl=30',
  gstRegDate:          'dd-MM-yyyy',
  annualTurnover:      '1=<10Lac 2=<50Lac 3=<1CR 4=<10CR',
  noOfEmployees:       '1=<50 2=50-300 3=300-1000 4=1000-3000 5=3000-5000 6=>5000',
  sizeOfFirm:          '1=MICRO 2=SMALL 3=MEDIUM 4=LARGE',
  custReason:          '1=APPROACHED BY BANK..7=RESPONSE TO ADVT',
  addressType:         '1=OFFICE 2=CORRESPONDENCE 3=PRESENT 4=PERMANENT',
  address1:            'Address Line 1 maxl=60 MANDATORY',
  address2:            'Address Line 2 maxl=60',
  address3:            'Address Line 3 maxl=60',
  pinCode:             '6 digits maxl=6',
  countryCode:         'IND=India',
  stateCode:           'Select2 text e.g. WEST BENGAL',
  districtCode:        'Select2 dependent on state',
  mobile1CountryCode:  '+91',
  mobileNo1:           '10 digits MANDATORY',
  emailId:             'Email maxl=50',
  contactPerson:       'Contact Person maxl=150',
  website:             'Website maxl=50',
  proofType:           '1=ADDRESS PROOF 2=IDENTITY PROOF (auto-picks first docType)',
  idNumber:            'Document Number maxl=50',
  issuedDate:          'dd-MM-yyyy',
  expiryDate:          'dd-MM-yyyy',
  nameAsInDocument:    'Name as per document maxl=150',
  recievedDate:        'dd-MM-yyyy',
  issuedBy:            'Select2: 8=UIDAI',
  tdsAvailable:        'Y or N',
  specialInstruct1:    'Special Instruction 1 maxl=60',
  specialInstruct2:    'Special Instruction 2 maxl=60',
};

// Row 1 (sanity): mandatory fields only — fast
// Rows 2+ (regression): full fields
const CREATE_ROWS = [
  {
    // SANITY — mandatory only
    customerCategory:'503-COMPANY', memberFName:`TestCompany${RUN}`, shortName:`TC${RUN}`,
    dateOfEstablishment:'01-01-2010', registrationNo:`REG${RUN}`, commencementDate:'',
    taxResidenceStatus:'1', pan:'', tinAvailable:'N', taxIdNo:'',
    gstNo:'', gstRegDate:'', annualTurnover:'', noOfEmployees:'', sizeOfFirm:'', custReason:'',
    addressType:'1', address1:`${RUN} Corp Street`, address2:'', address3:'', pinCode:'',
    countryCode:'', stateCode:'', districtCode:'',
    mobile1CountryCode:'', mobileNo1:`9${RUN}0001`, emailId:`corp${RUN}@testbank.com`, contactPerson:'', website:'',
    proofType:'2', idNumber:`9${RUN}000001`, issuedDate:'01-01-2020', expiryDate:'',
    nameAsInDocument:`TestCompany${RUN}`, recievedDate:'01-01-2020', issuedBy:'8',
    tdsAvailable:'N', specialInstruct1:'', specialInstruct2:'',
  },
  {
    // REGRESSION — full fields
    customerCategory:'501-SOCIETY', memberFName:`TestSociety${RUN}`, shortName:`SOC${RUN}`,
    dateOfEstablishment:'15-03-2005', registrationNo:`SREG${RUN}`, commencementDate:'01-04-2005',
    taxResidenceStatus:'1', pan:`AABCS${RUN.slice(0,4)}Z`, tinAvailable:'N', taxIdNo:'',
    gstNo:'', gstRegDate:'', annualTurnover:'1', noOfEmployees:'1', sizeOfFirm:'1', custReason:'2',
    addressType:'1', address1:`${RUN} Society Road`, address2:'', address3:'Memari', pinCode:'713146',
    countryCode:'IND', stateCode:'WEST BENGAL', districtCode:'306',
    mobile1CountryCode:'+91', mobileNo1:`7${RUN}0001`, emailId:`soc${RUN}@testbank.com`, contactPerson:`SecSoc${RUN}`, website:'',
    proofType:'2', idNumber:`7${RUN}000001`, issuedDate:'01-01-2018', expiryDate:'',
    nameAsInDocument:`TestSociety${RUN}`, recievedDate:'01-01-2018', issuedBy:'8',
    tdsAvailable:'N', specialInstruct1:'', specialInstruct2:'',
  },
  {
    // REGRESSION — full fields
    customerCategory:'504-PARTNERSHIP FIRM', memberFName:`TestPartner${RUN}`, shortName:`PF${RUN}`,
    dateOfEstablishment:'10-06-2012', registrationNo:`PREG${RUN}`, commencementDate:'01-07-2012',
    taxResidenceStatus:'1', pan:`AABCP${RUN.slice(0,4)}Z`, tinAvailable:'N', taxIdNo:'',
    gstNo:'', gstRegDate:'', annualTurnover:'2', noOfEmployees:'1', sizeOfFirm:'2', custReason:'3',
    addressType:'1', address1:`${RUN} Partner Lane`, address2:'', address3:'Asansol', pinCode:'713301',
    countryCode:'IND', stateCode:'WEST BENGAL', districtCode:'306',
    mobile1CountryCode:'+91', mobileNo1:`6${RUN}0001`, emailId:`pf${RUN}@testbank.com`, contactPerson:`PartnerContact${RUN}`, website:'',
    proofType:'2', idNumber:`6${RUN}000001`, issuedDate:'01-01-2019', expiryDate:'',
    nameAsInDocument:`TestPartner${RUN}`, recievedDate:'01-01-2019', issuedBy:'8',
    tdsAvailable:'N', specialInstruct1:'', specialInstruct2:'',
  },
];

const UPDATE_COLS = ['memberFName','shortName','emailId','mobileNo1','address1','specialInstruct1'];
const UPDATE_ROWS = [{ memberFName:`TestCompany${RUN} Updated`, shortName:`TCU${RUN}`, emailId:`corpupd${RUN}@testbank.com`, mobileNo1:`9${RUN}0002`, address1:`${RUN} Updated Street`, specialInstruct1:'Updated instruction' }];

const AUTH_COLS = ['memberFName','action','remark'];
const AUTH_ROWS = [
  { memberFName:`TestCompany${RUN}`, action:'APPROVE', remark:'' },
  { memberFName:`TestSociety${RUN}`, action:'APPROVE', remark:'' },
];

const NEG_COLS = ['memberFName','mobileNo1','emailId','pan','expectedError'];
const NEG_ROWS = [
  { memberFName:'', mobileNo1:'9876543210', emailId:'test@bank.com', pan:'', expectedError:'Name is required' },
  { memberFName:'NegTest', mobileNo1:'123', emailId:'test@bank.com', pan:'', expectedError:'Invalid mobile number' },
  { memberFName:'NegTest', mobileNo1:'9876543210', emailId:'invalid-email', pan:'', expectedError:'Invalid email' },
  { memberFName:'NegTest', mobileNo1:'9876543210', emailId:'test@bank.com', pan:'INVALIDPAN', expectedError:'Invalid PAN format' },
];

const DB_COLS = ['memberFName','expectedAuthStatus','expectedIsActive','expectedMobile'];
const DB_ROWS = [
  { memberFName:`TestCompany${RUN}`, expectedAuthStatus:'U', expectedIsActive:'1', expectedMobile:`9${RUN}0001` },
];

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
  addSheet('Update',    UPDATE_COLS, UPDATE_ROWS, null);
  addSheet('Authorize', AUTH_COLS,   AUTH_ROWS,   null);
  addSheet('Negative',  NEG_COLS,    NEG_ROWS,    null);
  addSheet('Database',  DB_COLS,     DB_ROWS,     null);

  await wb.xlsx.writeFile(OUT);
  console.log('Excel written:', OUT);
  console.log('Create:', CREATE_COLS.length, 'cols,', CREATE_ROWS.length, 'rows');
}

build().catch(console.error);
