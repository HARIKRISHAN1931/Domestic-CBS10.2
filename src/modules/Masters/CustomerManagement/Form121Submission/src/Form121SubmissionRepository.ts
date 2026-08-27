import { BaseRepository } from '../../../../../framework/base/BaseRepository';

export interface Form121DbRow {
  memberCode: string;
  authStatus: string;
  isActive:   number;
  finYear:    string;
  submitDate: string;
}

export class Form121SubmissionRepository extends BaseRepository {
  async findByMemberCode(memberCode: string): Promise<Form121DbRow | null> {
    return this.queryOne<Form121DbRow>(
      `SELECT TOP 1 memberCode, authStatus, isActive, finYear, submitDate
       FROM D020220 WHERE memberCode = @memberCode AND isActive = 1
       ORDER BY createdDate DESC`,
      { memberCode }
    );
  }
}
