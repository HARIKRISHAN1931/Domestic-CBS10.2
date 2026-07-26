import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface CountryMasterDbRow {
  authStatus: string;
  isActive:   number;
}

export class CountryMasterRepository extends BaseRepository {
  async findByCode(code: string): Promise<CountryMasterDbRow | null> {
    return this.queryOne<CountryMasterDbRow>(
      `SELECT authStatus, isActive FROM COUNTRYMASTER WHERE countryCode = @code AND isActive = 1`,
      { code }
    );
  }
}
