import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface SubdivisionthanaDbRow {
  authStatus: string;
  isActive:   number;
}

export class SubdivisionthanaRepository extends BaseRepository {
  async findByCode(code: string): Promise<SubdivisionthanaDbRow | null> {
    return this.queryOne<SubdivisionthanaDbRow>(
      `SELECT authStatus, isActive FROM SUBDIVISIONTHANA WHERE areaCd = @code AND isActive = 1`,
      { code }
    );
  }
}
