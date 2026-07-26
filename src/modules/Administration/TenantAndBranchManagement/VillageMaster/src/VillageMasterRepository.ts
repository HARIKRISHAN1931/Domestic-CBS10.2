import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface VillageMasterDbRow {
  authStatus: string;
  isActive:   number;
}

export class VillageMasterRepository extends BaseRepository {
  async findByCode(code: string): Promise<VillageMasterDbRow | null> {
    return this.queryOne<VillageMasterDbRow>(
      `SELECT authStatus, isActive FROM VILLAGEMASTER WHERE villageCode = @code AND isActive = 1`,
      { code }
    );
  }
}
