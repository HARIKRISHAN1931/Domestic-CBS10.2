const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'src', 'modules');
const menuMap = require('./menu-map.json');
const menuFolders = new Set(Object.keys(menuMap).map(k => k.split('/')[0]));

// Map: source folder (relative to BASE) -> destination menu folder (relative to BASE)
const migrations = [
  // Customer Creation
  {
    src: 'Customer/Retail/CustomerCreation',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  // Customer Modification
  {
    src: 'Customer/Retail/CustomerModification',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  // Customer Inquiry
  {
    src: 'Customer/Retail/CustomerInquiry',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  // Term Deposit
  {
    src: 'Deposit/TermDeposit',
    dst: 'Masters/TermDepositManagement/TermDepositContract'
  },
  // Fixed Deposit
  {
    src: 'Deposit/FixedDeposit',
    dst: 'Masters/TermDepositManagement/TermDepositContract'
  },
  // Loan Masters
  {
    src: 'Loans/LoanMasters',
    dst: 'Masters/LoansAndAdvancesGeneralMasters/LoanSecurityCollaterals'
  },
  // Loan Creation
  {
    src: 'Loans/LoanCreation',
    dst: 'Masters/TermLoans/LoanLimitDetails'
  },
  // Tenant Master
  {
    src: 'Administration/TenantMaster',
    dst: 'Administration/TenantAndBranchManagement/TenantMaster'
  },
  // RTGS Entry (old RTGSEntry folder)
  {
    src: 'Remittance/RTGSEntry',
    dst: 'Transaction/RtgsAndNeft/RtgsneftEntry'
  },
  // RTGSNeft (combined)
  {
    src: 'Remittance/RTGSNeft',
    dst: 'Transaction/RtgsAndNeft/RtgsneftEntry'
  },
  // NEFT Entry
  {
    src: 'Remittance/NEFTEntry',
    dst: 'Transaction/RtgsAndNeft/RtgsneftEntry'
  },
  // IMPS Entry
  {
    src: 'Remittance/IMPSEntry',
    dst: 'Transaction/RtgsAndNeft/ImpsoeMenunotRegistered'
  },
  // Account Opening
  {
    src: 'Account/Savings/AccountOpening',
    dst: 'Masters/AccountsManagement/CustomerAccountCreation'
  },
  // Old "Account Management" sub-folder files
  {
    src: 'Account Management/Account Opening/builders',
    dst: 'Masters/AccountsManagement/CustomerAccountCreation'
  },
  {
    src: 'Account Management/Account Opening/db',
    dst: 'Masters/AccountsManagement/CustomerAccountCreation'
  },
  {
    src: 'Account Management/Account Opening/pages',
    dst: 'Masters/AccountsManagement/CustomerAccountCreation'
  },
  {
    src: 'Account Management/Account Opening/tests',
    dst: 'Masters/AccountsManagement/CustomerAccountCreation'
  },
  // Old "Customer Management" sub-folder files
  {
    src: 'Customer Management/Customer Creation/api',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  {
    src: 'Customer Management/Customer Creation/builders',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  {
    src: 'Customer Management/Customer Creation/db',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  {
    src: 'Customer Management/Customer Creation/pages',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  {
    src: 'Customer Management/Customer Creation/testdata',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  {
    src: 'Customer Management/Customer Creation/tests',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  {
    src: 'Customer Management/Customer Creation/validators',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  {
    src: 'Customer Management/Customer Inquiry/pages',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  {
    src: 'Customer Management/Customer Modification/pages',
    dst: 'Masters/CustomerManagement/CustomerCreationretail'
  },
  // Old "Deposit" sub-folder files
  {
    src: 'Deposit/Fixed Deposit/pages',
    dst: 'Masters/TermDepositManagement/TermDepositContract'
  },
  // Old "Loans" sub-folder files
  {
    src: 'Loans/Loan Creation/pages',
    dst: 'Masters/TermLoans/LoanLimitDetails'
  },
  // Old "Remittance" sub-folder files
  {
    src: 'Remittance/RTGS Entry/builders',
    dst: 'Transaction/RtgsAndNeft/RtgsneftEntry'
  },
  {
    src: 'Remittance/RTGS Entry/pages',
    dst: 'Transaction/RtgsAndNeft/RtgsneftEntry'
  },
  {
    src: 'Remittance/RTGS Entry/tests',
    dst: 'Transaction/RtgsAndNeft/RtgsneftEntry'
  },
  {
    src: 'Remittance/NEFT Entry/pages',
    dst: 'Transaction/RtgsAndNeft/RtgsneftEntry'
  },
  {
    src: 'Remittance/IMPS Entry/pages',
    dst: 'Transaction/RtgsAndNeft/ImpsoeMenunotRegistered'
  },
];

let moved = 0, skipped = 0;

// Step 1: Move files
for (const { src, dst } of migrations) {
  const srcPath = path.join(BASE, src);
  const dstPath = path.join(BASE, dst);

  if (!fs.existsSync(srcPath)) continue;

  const stat = fs.statSync(srcPath);
  const files = stat.isDirectory()
    ? fs.readdirSync(srcPath).filter(f => fs.statSync(path.join(srcPath, f)).isFile())
    : [];

  if (files.length === 0) continue;

  fs.mkdirSync(dstPath, { recursive: true });

  for (const file of files) {
    const from = path.join(srcPath, file);
    const to = path.join(dstPath, file);
    if (fs.existsSync(to)) {
      console.log(`  SKIP (exists): ${dst}/${file}`);
      skipped++;
    } else {
      fs.copyFileSync(from, to);
      fs.unlinkSync(from);
      console.log(`  MOVED: ${src}/${file} -> ${dst}/${file}`);
      moved++;
    }
  }
}

console.log(`\nMoved: ${moved}, Skipped: ${skipped}`);

// Step 2: Delete all non-menu top-level folders
const topFolders = fs.readdirSync(BASE).filter(f => fs.statSync(path.join(BASE, f)).isDirectory());
let deleted = 0;

for (const folder of topFolders) {
  if (!menuFolders.has(folder)) {
    fs.rmSync(path.join(BASE, folder), { recursive: true, force: true });
    console.log(`DELETED non-menu folder: ${folder}`);
    deleted++;
  }
}

console.log(`\nDeleted ${deleted} non-menu top-level folders.`);
console.log('Done.');
