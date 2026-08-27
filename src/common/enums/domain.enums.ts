export enum TestTag {
  Smoke = '@sanity',
  Sanity = '@sanity',
  Regression = '@regression',
  E2E = '@e2e',
  Database = '@database',
}

export enum Environment {
  Dev = 'dev',
  QA = 'qa',
  UAT = 'uat',
  Prod = 'prod',
}

export enum AccountType {
  Savings = 'SAVINGS',
  Current = 'CURRENT',
  FixedDeposit = 'FIXED_DEPOSIT',
  RecurringDeposit = 'RECURRING_DEPOSIT',
}

export enum CustomerType {
  Individual = 'INDIVIDUAL',
  Corporate = 'CORPORATE',
  NRI = 'NRI',
}

export enum TransactionStatus {
  Pending = 'PENDING',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
  Processed = 'PROCESSED',
}

export enum RemittanceType {
  RTGS = 'RTGS',
  NEFT = 'NEFT',
  IMPS = 'IMPS',
}

export enum LoanStatus {
  Applied = 'APPLIED',
  Sanctioned = 'SANCTIONED',
  Disbursed = 'DISBURSED',
  Closed = 'CLOSED',
}

export enum AuthorizationStatus {
  Pending = 'PENDING',
  Authorized = 'AUTHORIZED',
  Rejected = 'REJECTED',
}
