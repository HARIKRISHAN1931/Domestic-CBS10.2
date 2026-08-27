import { BaseRepository } from '../../../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../../../framework/database/DatabaseConnectionManager';
import { RtgsNeftDbRow } from './RtgsNeftEntryBuilder';

export class RtgsNeftEntryRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findBySetNo(setNo: string): Promise<RtgsNeftDbRow | null> {
    return this.queryOne<RtgsNeftDbRow>(
      `SELECT setNo, scrollNo, authStatus, isActive, msgTrfType, valueAmt
       FROM D946020
       WHERE setNo = :setNo
       ORDER BY entryDate DESC`,
      { setNo },
    );
  }

  async findByScrollNo(scrollNo: string): Promise<RtgsNeftDbRow | null> {
    return this.queryOne<RtgsNeftDbRow>(
      `SELECT setNo, scrollNo, authStatus, isActive, msgTrfType, valueAmt
       FROM D946020
       WHERE scrollNo = :scrollNo
       ORDER BY entryDate DESC`,
      { scrollNo },
    );
  }
}
