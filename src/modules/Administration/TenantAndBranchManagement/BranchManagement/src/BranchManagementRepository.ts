import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface BranchManagementDbRow {
  authStatus: string;
  isActive:   number;
}

export class BranchManagementRepository extends BaseRepository {
  async findByCode(code: string): Promise<BranchManagementDbRow | null> {
    return this.queryOne<BranchManagementDbRow>(
      `SELECT authStatus, isActive FROM BRANCHMANAGEMENT WHERE branchCode = @code AND isActive = 1`,
      { code }
    );
  }
}
