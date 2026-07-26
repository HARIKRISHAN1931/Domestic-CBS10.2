import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface StateMasterDbRow {
  authStatus: string;
  isActive:   number;
}

export class StateMasterRepository extends BaseRepository {
  async findByCode(code: string): Promise<StateMasterDbRow | null> {
    return this.queryOne<StateMasterDbRow>(
      `SELECT authStatus, isActive FROM STATEMASTER WHERE stateCode = @code AND isActive = 1`,
      { code }
    );
  }
}
