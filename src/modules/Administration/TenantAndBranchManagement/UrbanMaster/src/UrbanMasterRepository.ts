import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface UrbanMasterDbRow {
  authStatus: string;
  isActive:   number;
}

export class UrbanMasterRepository extends BaseRepository {
  async findByCode(code: string): Promise<UrbanMasterDbRow | null> {
    return this.queryOne<UrbanMasterDbRow>(
      `SELECT authStatus, isActive FROM URBANMASTER WHERE urbanCode = @code AND isActive = 1`,
      { code }
    );
  }
}
