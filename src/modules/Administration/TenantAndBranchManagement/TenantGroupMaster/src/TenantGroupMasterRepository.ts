import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface TenantGroupMasterDbRow {
  authStatus: string;
  isActive:   number;
}

export class TenantGroupMasterRepository extends BaseRepository {
  async findByCode(code: string): Promise<TenantGroupMasterDbRow | null> {
    return this.queryOne<TenantGroupMasterDbRow>(
      `SELECT authStatus, isActive FROM TENANTGROUPMASTER WHERE institutionId = @code AND isActive = 1`,
      { code }
    );
  }
}
