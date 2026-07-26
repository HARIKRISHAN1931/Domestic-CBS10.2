import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface BranchToBranchDataMappingDbRow {
  fromBranch: string;
  authStatus: string;
  isActive:   number;
}

export class BranchToBranchDataMappingRepository extends BaseRepository {
  async findByCode(code: string): Promise<BranchToBranchDataMappingDbRow | null> {
    return this.queryOne<BranchToBranchDataMappingDbRow>(
      `SELECT fromBranch, authStatus, isActive FROM BRANCHTOBRANCHDATAMAPPING WHERE fromBranch = @code AND isActive = 1`,
      { code }
    );
  }

  async findAuthorized(code: string): Promise<BranchToBranchDataMappingDbRow | null> {
    return this.queryOne<BranchToBranchDataMappingDbRow>(
      `SELECT fromBranch, authStatus, isActive FROM BRANCHTOBRANCHDATAMAPPING WHERE fromBranch = @code AND authStatus = 'A' AND isActive = 1`,
      { code }
    );
  }
}
