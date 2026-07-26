import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface TenantMasterDbRow {
  authStatus: string;
  isActive:   number;
}

export class TenantMasterRepository extends BaseRepository {
  async findByCode(code: string): Promise<TenantMasterDbRow | null> {
    return this.queryOne<TenantMasterDbRow>(
      `SELECT authStatus, isActive FROM TENANTMASTER WHERE tenantId = @code AND isActive = 1`,
      { code }
    );
  }
}
