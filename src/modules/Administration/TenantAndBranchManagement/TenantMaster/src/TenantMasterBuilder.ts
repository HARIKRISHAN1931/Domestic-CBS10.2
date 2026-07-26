import { expect } from '@playwright/test';
import { TenantMasterData } from './TenantMasterPage';
import { TenantDbRow } from './TenantMasterRepository';

export class TenantMasterBuilder {
  private data: TenantMasterData = {
    tenantId:        'TEST001',
    institutionName: 'Test Co-operative Bank Ltd',
  };

  withTenantId(v: string):   this { this.data.tenantId        = v; return this; }
  withName(v: string):       this { this.data.institutionName = v; return this; }
  withAddress(v: string):    this { this.data.address1        = v; return this; }
  withPinCode(v: string):    this { this.data.pinCode         = v; return this; }
  withTag(v: string):        this { this.data.tag             = v; return this; }

  build(): TenantMasterData { return { ...this.data }; }
}

export class TenantMasterValidator {
  validateCreated(toast: string): void {
    expect(toast, 'Tenant master success toast must appear').toBeTruthy();
  }

  validateDbPending(row: TenantDbRow | null, tenantCode: string): void {
    expect(row, `Tenant ${tenantCode} must exist in D001001`).not.toBeNull();
    expect(['U', 'P'], `authStatus must be U or P after create`).toContain(row!.authStatus);
  }

  validateDbAuthorized(row: TenantDbRow | null, tenantCode: string): void {
    expect(row, `Tenant ${tenantCode} must exist in D001001`).not.toBeNull();
    expect(row!.authStatus, 'authStatus must be A after authorize').toBe('A');
  }
}
