import { AccountType, CustomerType, LoanStatus, RemittanceType, TransactionStatus } from '../enums/domain.enums';

export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  panNumber: string;
  aadhaarNumber: string;
  mobileNumber: string;
  email: string;
  address: Address;
  customerType: CustomerType;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Account {
  accountNumber: string;
  customerId: string;
  accountType: AccountType;
  branchCode: string;
  openingDate: string;
  balance: number;
  status: string;
}

export interface Transaction {
  transactionId: string;
  accountNumber: string;
  amount: number;
  type: RemittanceType;
  status: TransactionStatus;
  valueDate: string;
  remarks: string;
}

export interface Loan {
  loanId: string;
  customerId: string;
  loanAmount: number;
  tenure: number;
  interestRate: number;
  status: LoanStatus;
  disbursementDate?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
