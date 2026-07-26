import { CustomerData } from './CustomerCreationPage';

export class CustomerCreationBuilder {
  private data: CustomerData = {
    customerCategory: '1',
    memberFName:      'Test',
    memberLName:      'Customer',
    memberDOB:        '01-01-1990',
  };

  withCategory(v: string):      this { this.data.customerCategory = v; return this; }
  withFirstName(v: string):     this { this.data.memberFName = v; return this; }
  withLastName(v: string):      this { this.data.memberLName = v; return this; }
  withDOB(v: string):           this { this.data.memberDOB = v; return this; }
  withGender(v: string):        this { this.data.memberGender = v; return this; }
  withPAN(v: string):           this { this.data.pan = v; return this; }
  withMobile(v: string):        this { this.data.mobileNo1 = v; return this; }
  withEmail(v: string):         this { this.data.emailId = v; return this; }
  withAddress(v: string):       this { this.data.address1 = v; return this; }
  withPinCode(v: string):       this { this.data.pinCode = v; return this; }
  withCountry(v: string):       this { this.data.countryCode = v; return this; }
  withState(v: string):         this { this.data.stateCode = v; return this; }
  withTag(v: string):           this { this.data.tag = v; return this; }

  build(): CustomerData { return { ...this.data }; }
}
