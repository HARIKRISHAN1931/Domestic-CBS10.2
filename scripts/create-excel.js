const ExcelJS = require('exceljs');
const path = require('path');

const base = path.resolve(__dirname, '../src/modules');

async function createExcel(filePath, sheets) {
  const wb = new ExcelJS.Workbook();
  for (const [name, rows] of Object.entries(sheets)) {
    const ws = wb.addWorksheet(name);
    rows.forEach(row => ws.addRow(row));
  }
  await wb.xlsx.writeFile(filePath);
  console.log('Created: ' + filePath);
}

async function main() {
  await createExcel(path.join(base, 'Customer/Retail/CustomerCreation/customer-creation.data.xlsx'), {
    Create: [
      ['firstName','lastName','dateOfBirth','panNumber','aadhaarNumber','mobileNumber','email','customerType','addressLine1','city','state','pincode','country'],
      ['Rajesh','Kumar','15/06/1985','ABCDE1234F','123456789012','9876543210','rajesh.kumar@test.com','INDIVIDUAL','123 MG Road','Mumbai','Maharashtra','400001','India'],
      ['Priya','Sharma','20/03/1990','FGHIJ5678K','234567890123','8765432109','priya.sharma@test.com','INDIVIDUAL','456 Park Street','Delhi','Delhi','110001','India'],
    ],
    Update: [
      ['customerId','mobileNumber','email'],
      ['CUST001','9999999999','updated@test.com'],
    ],
    Authorize: [
      ['customerId','expectedStatus'],
      ['CUST001','AUTHORIZED'],
    ],
    Negative: [
      ['scenario','panNumber','mobileNumber','expectedError'],
      ['Missing PAN','','9876543210','panNumber'],
      ['Invalid Mobile','ABCDE1234F','12345','mobileNumber'],
    ],
    Database: [
      ['customerId','expectedPAN','expectedStatus'],
      ['CUST001','ABCDE1234F','ACTIVE'],
    ],
  });

  await createExcel(path.join(base, 'Account/Savings/AccountOpening/account-opening.data.xlsx'), {
    Create: [
      ['customerId','accountType','branchCode','initialDeposit','nomineeName','nomineeRelation'],
      ['CUST001','SAVINGS','001','10000','Spouse Name','SPOUSE'],
      ['CUST002','CURRENT','001','25000','',''],
    ],
    Update: [
      ['accountNumber','nomineeName','nomineeRelation'],
      ['ACC001','New Nominee','PARENT'],
    ],
    Authorize: [
      ['accountNumber','expectedStatus'],
      ['ACC001','AUTHORIZED'],
    ],
    Negative: [
      ['scenario','customerId','accountType','initialDeposit','expectedError'],
      ['Invalid Customer','INVALID999','SAVINGS','10000','customerId'],
      ['Zero Deposit','CUST001','SAVINGS','0','initialDeposit'],
    ],
    Database: [
      ['accountNumber','expectedType','expectedStatus'],
      ['ACC001','SAVINGS','ACTIVE'],
    ],
  });

  await createExcel(path.join(base, 'Remittance/RTGSEntry/rtgs-entry.data.xlsx'), {
    Create: [
      ['debitAccountNumber','beneficiaryName','beneficiaryAccountNumber','beneficiaryIFSC','amount','remarks'],
      ['ACC001234567','Test Beneficiary','98765432109876','HDFC0001234','500000','Automation Test'],
    ],
    Update: [
      ['transactionRef','remarks'],
      ['TXN001','Updated remarks'],
    ],
    Authorize: [
      ['transactionRef','expectedStatus'],
      ['TXN001','AUTHORIZED'],
    ],
    Negative: [
      ['scenario','amount','beneficiaryIFSC','expectedError'],
      ['Below Minimum','100000','HDFC0001234','amount'],
      ['Invalid IFSC','500000','INVALID','beneficiaryIFSC'],
    ],
    Database: [
      ['transactionRef','expectedAmount','expectedStatus'],
      ['TXN001','500000','PROCESSED'],
    ],
  });

  await createExcel(path.join(base, 'Remittance/NEFTEntry/neft-entry.data.xlsx'), {
    Create: [
      ['debitAccountNumber','beneficiaryName','beneficiaryAccountNumber','beneficiaryIFSC','amount','remarks'],
      ['ACC001234567','NEFT Beneficiary','12345678901234','SBIN0001234','50000','NEFT Test'],
    ],
    Update: [
      ['transactionRef','remarks'],
      ['NEFT001','Updated'],
    ],
    Authorize: [
      ['transactionRef','expectedStatus'],
      ['NEFT001','AUTHORIZED'],
    ],
    Negative: [
      ['scenario','amount','expectedError'],
      ['Zero Amount','0','amount'],
    ],
    Database: [
      ['transactionRef','expectedAmount','expectedStatus'],
      ['NEFT001','50000','PROCESSED'],
    ],
  });

  await createExcel(path.join(base, 'Remittance/IMPSEntry/imps-entry.data.xlsx'), {
    Create: [
      ['debitAccountNumber','beneficiaryMobile','beneficiaryMMID','amount','remarks'],
      ['ACC001234567','9876543210','1234567','10000','IMPS Test'],
    ],
    Update: [
      ['transactionRef','remarks'],
      ['IMPS001','Updated'],
    ],
    Authorize: [
      ['transactionRef','expectedStatus'],
      ['IMPS001','AUTHORIZED'],
    ],
    Negative: [
      ['scenario','amount','expectedError'],
      ['Exceeds Limit','300000','amount'],
    ],
    Database: [
      ['transactionRef','expectedAmount','expectedStatus'],
      ['IMPS001','10000','PROCESSED'],
    ],
  });

  await createExcel(path.join(base, 'Deposit/FixedDeposit/fixed-deposit.data.xlsx'), {
    Create: [
      ['accountNumber','depositAmount','tenureMonths','maturityInstructions'],
      ['ACC001','100000','12','RENEW'],
      ['ACC002','50000','24','PAYOUT'],
    ],
    Update: [
      ['fdNumber','maturityInstructions'],
      ['FD001','PAYOUT'],
    ],
    Authorize: [
      ['fdNumber','expectedStatus'],
      ['FD001','AUTHORIZED'],
    ],
    Negative: [
      ['scenario','depositAmount','tenureMonths','expectedError'],
      ['Zero Amount','0','12','depositAmount'],
    ],
    Database: [
      ['fdNumber','expectedAmount','expectedStatus'],
      ['FD001','100000','ACTIVE'],
    ],
  });

  await createExcel(path.join(base, 'Loans/LoanCreation/loan-creation.data.xlsx'), {
    Create: [
      ['customerId','loanType','loanAmount','tenureMonths','purpose'],
      ['CUST001','HOME_LOAN','5000000','240','Home Purchase'],
      ['CUST002','PERSONAL_LOAN','500000','60','Personal Use'],
    ],
    Update: [
      ['loanId','purpose'],
      ['LOAN001','Updated Purpose'],
    ],
    Authorize: [
      ['loanId','expectedStatus'],
      ['LOAN001','AUTHORIZED'],
    ],
    Negative: [
      ['scenario','loanAmount','expectedError'],
      ['Zero Amount','0','loanAmount'],
    ],
    Database: [
      ['loanId','expectedAmount','expectedStatus'],
      ['LOAN001','5000000','APPLIED'],
    ],
  });

  console.log('All Excel test data files created successfully.');
}

main().catch(console.error);
