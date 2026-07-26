const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'src', 'modules');

// Each screen: folder path, screen name, files mapping
const screens = [
  {
    dir: 'Administration/TenantAndBranchManagement/TenantMaster',
    name: 'TenantMaster',
    src: ['TenantMasterPage.ts', 'TenantMasterRepository.ts', 'TenantMasterBuilder.ts'],
    tests: [{ from: 'tenant-master.spec.ts', to: 'create.spec.ts' }],
    data: [],
    deleteExtra: [],
  },
  {
    dir: 'Masters/AccountsManagement/CustomerAccountCreation',
    name: 'CustomerAccountCreation',
    src: ['AccountOpeningPage.ts', 'AccountOpeningRepository.ts', 'AccountOpeningBuilder.ts', 'AccountOpeningValidator.ts'],
    tests: [{ from: 'account-opening.spec.ts', to: 'create.spec.ts' }],
    data: [{ from: 'account-opening.data.xlsx', to: 'CustomerAccountCreation.xlsx' }],
    deleteExtra: [],
  },
  {
    dir: 'Masters/CustomerManagement/CustomerCreationretail',
    name: 'CustomerCreationRetail',
    src: ['CustomerCreationPage.ts', 'CustomerCreationRepository.ts', 'CustomerCreationBuilder.ts', 'CustomerCreationValidator.ts',
          'CustomerInquiryPage.ts', 'CustomerModificationPage.ts', 'CustomerModificationRepository.ts', 'CustomerModificationValidator.ts'],
    tests: [{ from: 'customer-creation.spec.ts', to: 'create.spec.ts' }],
    data: [{ from: 'customer-creation.data.xlsx', to: 'CustomerCreationRetail.xlsx' }],
    deleteExtra: ['CustomerCreationApiClient.ts', 'customer-creation.data.json'],
  },
  {
    dir: 'Masters/LoansAndAdvancesGeneralMasters/LoanSecurityCollaterals',
    name: 'LoanSecurityCollaterals',
    src: ['LoanMastersPage.ts', 'LoanMastersRepository.ts', 'LoanMastersBuilder.ts'],
    tests: [{ from: 'loan-masters.spec.ts', to: 'create.spec.ts' }],
    data: [],
    deleteExtra: [],
  },
  {
    dir: 'Masters/TermDepositManagement/TermDepositContract',
    name: 'TermDepositContract',
    src: ['TermDepositPage.ts', 'TermDepositRepository.ts', 'TermDepositBuilder.ts', 'TermDepositValidator.ts'],
    tests: [{ from: 'term-deposit.spec.ts', to: 'create.spec.ts' }],
    data: [{ from: 'fixed-deposit.data.xlsx', to: 'TermDepositContract.xlsx' }],
    // FixedDeposit files are duplicates of TermDeposit — delete them
    deleteExtra: ['FixedDepositBuilder.ts', 'FixedDepositPage.ts', 'FixedDepositRepository.ts',
                  'FixedDepositValidator.ts', 'fixed-deposit.spec.ts'],
  },
  {
    dir: 'Masters/TermLoans/LoanLimitDetails',
    name: 'LoanLimitDetails',
    src: ['LoanCreationPage.ts', 'LoanCreationRepository.ts', 'LoanCreationBuilder.ts', 'LoanCreationValidator.ts'],
    tests: [{ from: 'loan-creation.spec.ts', to: 'create.spec.ts' }],
    data: [{ from: 'loan-creation.data.xlsx', to: 'LoanLimitDetails.xlsx' }],
    deleteExtra: [],
  },
  {
    dir: 'Transaction/RtgsAndNeft/RtgsneftEntry',
    name: 'RtgsneftEntry',
    src: ['RTGSEntryPage.ts', 'RTGSEntryRepository.ts', 'RTGSEntryBuilder.ts', 'RTGSEntryValidator.ts',
          'NEFTEntryPage.ts', 'NEFTEntryRepository.ts', 'NEFTEntryBuilder.ts', 'NEFTEntryValidator.ts'],
    tests: [{ from: 'rtgs-entry.spec.ts', to: 'create.spec.ts' }],
    data: [{ from: 'rtgs-entry.data.xlsx', to: 'RtgsneftEntry.xlsx' }],
    // RTGSNeft* and neft-entry* are duplicates
    deleteExtra: ['RTGSNeftBuilder.ts', 'RTGSNeftPage.ts', 'RTGSNeftRepository.ts',
                  'rtgs-neft.spec.ts', 'neft-entry.spec.ts', 'neft-entry.data.xlsx'],
  },
  {
    dir: 'Transaction/RtgsAndNeft/ImpsoeMenunotRegistered',
    name: 'ImpsEntry',
    src: ['IMPSEntryPage.ts', 'IMPSEntryRepository.ts', 'IMPSEntryBuilder.ts', 'IMPSEntryValidator.ts'],
    tests: [{ from: 'imps-entry.spec.ts', to: 'create.spec.ts' }],
    data: [{ from: 'imps-entry.data.xlsx', to: 'ImpsEntry.xlsx' }],
    deleteExtra: [],
  },
];

const stub = (name, type) => {
  if (type === 'spec') return `import { test } from '../../../../../framework/fixtures/fixtures';\n\ntest.describe('${name}', () => {\n  test('placeholder @smoke', async ({ page }) => {\n    // TODO\n  });\n});\n`;
  return `# ${name}\n\nScreen automation for ${name}.\n\n## Structure\n\n- \`src/\` — Page, Repository, Builder, Validator\n- \`tests/\` — create, update, authorize, negative, db specs\n- \`data/\` — Excel test data\n`;
};

let moved = 0, created = 0, deleted = 0;

for (const screen of screens) {
  const screenDir = path.join(BASE, screen.dir);
  const srcDir = path.join(screenDir, 'src');
  const testsDir = path.join(screenDir, 'tests');
  const dataDir = path.join(screenDir, 'data');

  fs.mkdirSync(srcDir, { recursive: true });
  fs.mkdirSync(testsDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });

  // Move src files
  for (const file of screen.src) {
    const from = path.join(screenDir, file);
    const to = path.join(srcDir, file);
    if (fs.existsSync(from)) {
      fs.renameSync(from, to);
      console.log(`  SRC: ${screen.dir}/${file} -> src/${file}`);
      moved++;
    }
  }

  // Move & rename test files
  for (const { from, to } of screen.tests) {
    const fromPath = path.join(screenDir, from);
    const toPath = path.join(testsDir, to);
    if (fs.existsSync(fromPath)) {
      fs.renameSync(fromPath, toPath);
      console.log(`  TEST: ${from} -> tests/${to}`);
      moved++;
    }
  }

  // Create stub spec files for update/authorize/negative/db
  const stubs = ['update.spec.ts', 'authorize.spec.ts', 'negative.spec.ts', 'db.spec.ts'];
  for (const s of stubs) {
    const p = path.join(testsDir, s);
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, stub(screen.name, 'spec'));
      console.log(`  STUB: tests/${s}`);
      created++;
    }
  }

  // Move & rename data files
  for (const { from, to } of screen.data) {
    const fromPath = path.join(screenDir, from);
    const toPath = path.join(dataDir, to);
    if (fs.existsSync(fromPath)) {
      fs.renameSync(fromPath, toPath);
      console.log(`  DATA: ${from} -> data/${to}`);
      moved++;
    }
  }

  // Delete duplicates/dead files
  for (const file of screen.deleteExtra) {
    const p = path.join(screenDir, file);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`  DEL: ${file}`);
      deleted++;
    }
  }

  // Create README.md
  const readme = path.join(screenDir, 'README.md');
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(readme, stub(screen.name, 'readme'));
    console.log(`  README: ${screen.dir}/README.md`);
    created++;
  }
}

// Delete stray empty Administration/TenantMaster folder
const stray = path.join(BASE, 'Administration', 'TenantMaster');
if (fs.existsSync(stray)) {
  fs.rmSync(stray, { recursive: true, force: true });
  console.log('  DEL stray: Administration/TenantMaster/');
  deleted++;
}

console.log(`\nMoved: ${moved} | Created: ${created} | Deleted: ${deleted}`);
console.log('Done.');
