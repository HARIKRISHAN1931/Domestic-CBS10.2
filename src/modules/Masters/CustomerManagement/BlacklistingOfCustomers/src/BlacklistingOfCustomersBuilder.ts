import { expect } from '@playwright/test';
import { BlacklistingOfCustomersData } from './BlacklistingOfCustomersPage';

export class BlacklistingOfCustomersBuilder {
  private data: BlacklistingOfCustomersData = {
    custNo:          '',
    blacklistReason: '1',
    blacklistDate:   '01-01-2024',
    remarks:         'Blacklisted by automation test',
  };

  withCustNo(v: string):          this { this.data.custNo = v; return this; }
  withReason(v: string):          this { this.data.blacklistReason = v; return this; }
  withDate(v: string):            this { this.data.blacklistDate = v; return this; }
  withRemarks(v: string):         this { this.data.remarks = v; return this; }

  build(): BlacklistingOfCustomersData { return { ...this.data }; }
}

export class BlacklistingOfCustomersValidator {
  validateCreated(toast: string): void {
    expect(toast, 'Success toast must appear after blacklist create').toBeTruthy();
  }
  validateApproved(toast: string): void {
    expect(toast, 'Success toast must appear after blacklist authorize').toBeTruthy();
  }
  validateUpdated(toast: string): void {
    expect(toast, 'Success toast must appear after blacklist update').toBeTruthy();
  }
  validateDbRecord(row: BlacklistDbRow | null, custNo: string): void {
    expect(row, `Blacklist record for custNo ${custNo} must exist in DB`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be U after create').toBe('U');
  }
  validateDbAuthorized(row: BlacklistDbRow | null, custNo: string): void {
    expect(row, `Blacklist record for custNo ${custNo} must exist in DB`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  }
}

export interface BlacklistDbRow {
  custNo:     string;
  authStatus: string;
  isActive:   number;
}
