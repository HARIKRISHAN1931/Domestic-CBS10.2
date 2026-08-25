import { expect } from '@playwright/test';
import { TermDepositPage } from './TermDepositPage';
import { TermDepositRepository } from './TermDepositRepository';

export class TermDepositValidator {
  constructor(
    private readonly page: TermDepositPage,
    private readonly repo: TermDepositRepository,
  ) {}

  async verifyPendingInGrid(searchText: string): Promise<void> {
    await this.page.switchToPendingTab();
    expect(
      await this.page.isRecordInPendingGrid(searchText),
      `${searchText} must appear in pending grid`
    ).toBe(true);
  }

  async verifyInDatabase(prdAcctId: string): Promise<void> {
    const record = await this.repo.findByAccountId(prdAcctId);
    expect(record, `TD contract ${prdAcctId} must exist in DB`).not.toBeNull();
  }

  async verifyAuthorized(prdAcctId: string): Promise<void> {
    const record = await this.repo.findAuthorized(prdAcctId);
    expect(record, `TD contract ${prdAcctId} must be authorized in DB`).not.toBeNull();
    expect(record?.authStatus).toBe('A');
  }

  async verifyCustomerHasContracts(customerId: string): Promise<void> {
    const count = await this.repo.countByCustomer(customerId);
    expect(count, `Customer ${customerId} must have at least one TD contract`).toBeGreaterThan(0);
  }
}
