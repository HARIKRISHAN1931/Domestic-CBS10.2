import { BaseRepository } from '../../../../../framework/base/BaseRepository';
import { BlacklistDbRow } from './BlacklistingOfCustomersBuilder';

export class BlacklistingOfCustomersRepository extends BaseRepository {
  async findByCustNo(custNo: string): Promise<BlacklistDbRow | null> {
    return this.queryOne<BlacklistDbRow>(
      `SELECT TOP 1 custNo, authStatus, isActive
       FROM custBlacklistMaster WHERE custNo = @custNo AND isActive = 1
       ORDER BY createdDate DESC`,
      { custNo }
    );
  }
}
