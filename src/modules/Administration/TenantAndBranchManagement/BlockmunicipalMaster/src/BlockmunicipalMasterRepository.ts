import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface BlockmunicipalMasterDbRow {
  authStatus: string;
  isActive:   number;
}

export class BlockmunicipalMasterRepository extends BaseRepository {
  async findByCode(code: string): Promise<BlockmunicipalMasterDbRow | null> {
    return this.queryOne<BlockmunicipalMasterDbRow>(
      `SELECT authStatus, isActive FROM BLOCKMUNICIPALMASTER WHERE blockCode = @code AND isActive = 1`,
      { code }
    );
  }
}
