import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface DistrictMasterDbRow {
  authStatus: string;
  isActive:   number;
}

export class DistrictMasterRepository extends BaseRepository {
  async findByCode(code: string): Promise<DistrictMasterDbRow | null> {
    return this.queryOne<DistrictMasterDbRow>(
      `SELECT authStatus, isActive FROM DISTRICTMASTER WHERE districtCode = @code AND isActive = 1`,
      { code }
    );
  }
}
