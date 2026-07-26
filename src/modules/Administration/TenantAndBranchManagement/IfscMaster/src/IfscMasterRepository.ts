import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface IfscMasterDbRow {
  authStatus: string;
  isActive:   number;
}

export class IfscMasterRepository extends BaseRepository {
  async findByCode(code: string): Promise<IfscMasterDbRow | null> {
    return this.queryOne<IfscMasterDbRow>(
      `SELECT authStatus, isActive FROM IFSCMASTER WHERE ifscCd = @code AND isActive = 1`,
      { code }
    );
  }
}
