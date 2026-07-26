import { TDContractData } from './TermDepositPage';

export class TermDepositBuilder {
  private data: TDContractData = {
    customerCode:  '',
    productCode:   '',
    schemeCode:    '1',
    depositAmount: '10000',
  };

  withCustomer(v: string):       this { this.data.customerCode  = v; return this; }
  withProduct(v: string):        this { this.data.productCode   = v; return this; }
  withScheme(v: string):         this { this.data.schemeCode    = v; return this; }
  withAmount(v: string):         this { this.data.depositAmount = v; return this; }
  withMonths(v: string):         this { this.data.depositMonths = v; return this; }
  withDays(v: string):           this { this.data.depositDays   = v; return this; }
  withAutoRenew(v: 'Y' | 'N'):   this { this.data.autoRenewYn  = v; return this; }
  withTag(v: string):            this { this.data.tag           = v; return this; }

  build(): TDContractData { return { ...this.data }; }
}
