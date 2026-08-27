const fs   = require('fs');
const path = require('path');

const fp = path.resolve(__dirname, '../src/modules/Masters/AccountsManagement/CustomerAccountCreation/src/AccountOpeningPage.ts');
let content = fs.readFileSync(fp, 'utf-8');

// Fix approve()
const approveOld = /async approve\(searchText: string\): Promise<string> \{[\s\S]*?return \(await toast\.innerText\(\)\)\.trim\(\);\s*\n\s*\}/;
const approveNew = `async approve(searchText: string): Promise<string> {
    const row = this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.hover();
    await this.page.waitForTimeout(500);
    await row.locator('a[href*="callAuthRejectfn"], a.show-btns').first().click({ force: true });
    await this.page.locator('#approveBtn').waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.locator('#approveBtn').click();
    await this.page.waitForTimeout(500);
    await this.page.locator('#btnApproveId').click({ force: true });
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }`;

// Fix reject()
const rejectOld = /async reject\(searchText: string, remark: string\): Promise<string> \{[\s\S]*?return \(await toast\.innerText\(\)\)\.trim\(\);\s*\n\s*\}/;
const rejectNew = `async reject(searchText: string, remark: string): Promise<string> {
    const row = this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.hover();
    await this.page.waitForTimeout(500);
    await row.locator('a[href*="callAuthRejectfn"], a.show-btns').first().click({ force: true });
    await this.page.locator('#rejectBtn').waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.locator('#rejectBtn').click();
    await this.page.waitForTimeout(500);
    await this.page.locator('#btnRejectId').click({ force: true });
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }`;

// Add verifyAllFieldsReadOnly() before the closing }
const readOnlyMethod = `
  // ── Auth mode validation ──────────────────────────────────────────────────────
  // In authorization view all form inputs/selects must be read-only or disabled
  async verifyAllFieldsReadOnly(): Promise<{ editableFields: string[] }> {
    const editableFields: string[] = [];
    const fieldIds = [
      'customerNumber', 'moduleCode', 'productCode', 'schemeCode',
      'modeOfOperation', 'nomineeY', 'nomineeN',
      'documentFileNumber', 'additionalInformation1', 'additionalInformation2',
      'stmtFreq', 'stmtMode', 'addressType',
      'address1', 'address2', 'address3', 'countryCode',
    ];
    for (const id of fieldIds) {
      const loc = this.page.locator(\`#\${id}\`).first();
      const exists = await loc.isVisible({ timeout: 500 }).catch(() => false);
      if (!exists) continue;
      const isDisabled = await loc.isDisabled().catch(() => false);
      const isReadonly = await loc.getAttribute('readonly').then(v => v !== null).catch(() => false);
      const tagName    = await loc.evaluate((el: Element) => el.tagName.toLowerCase()).catch(() => '');
      // select elements in CBS auth mode are disabled; inputs have readonly attr
      if (!isDisabled && !isReadonly) {
        editableFields.push(\`#\${id} (\${tagName})\`);
      }
    }
    return { editableFields };
  }
`;

content = content.replace(approveOld, approveNew);
content = content.replace(rejectOld, rejectNew);
// Insert verifyAllFieldsReadOnly before the last closing brace of the class
content = content.replace(/(\n}\s*$)/, readOnlyMethod + '\n}');

fs.writeFileSync(fp, content, 'utf-8');
console.log('Done: fixed approve/reject + added verifyAllFieldsReadOnly()');
