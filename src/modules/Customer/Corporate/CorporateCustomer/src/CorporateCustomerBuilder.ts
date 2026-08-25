import { expect } from '@playwright/test';
import { CorporateCustomerData } from './CorporateCustomerPage';

const RUN = Date.now().toString().slice(-6);

export class CorporateCustomerBuilder {
  private data: CorporateCustomerData = {
    customerCategory:     '503-COMPANY',
    memberFName:          `Test Corp ${RUN}`,
    shortName:            `TC${RUN}`,
    dateOfEstablishment:  '01-01-2010',
    registrationNo:       `REG${RUN}`,
    commencementDate:     '01-06-2010',
    taxResidenceStatus:   '1',
    pan:                  `AABCT${RUN.slice(0,4)}Z`,
    tinAvailable:         'N',
    gstNo:                `27AABCT${RUN}Z1Z`,
    gstRegDate:           '01-07-2017',
    annualTurnover:       '3',
    noOfEmployees:        '2',
    sizeOfFirm:           '2',
    operationYears:       '10',
    custReason:           '1',
    addressType:          '1',
    address1:             `${RUN} Corporate Street`,
    address2:             'Business Park',
    address3:             'Burdwan',
    pinCode:              '713101',
    countryCode:          'IND',
    stateCode:            'WEST BENGAL',
    districtCode:         '306',
    mobile1CountryCode:   '+91',
    mobileNo1:            `9${RUN}0001`,
    emailId:              `corp${RUN}@testbank.com`,
    contactPerson:        `Contact ${RUN}`,
    proofType:            '2',
    idNumber:             `9${RUN}000001`,
    issuedDate:           '01-01-2020',
    nameAsInDocument:     `Test Corp ${RUN}`,
    recievedDate:         '01-01-2020',
    issuedBy:             '8',
    tdsAvailable:         'N',
    specialInstruct1:     'Handle with care',
  };

  withName(v: string):             this { this.data.memberFName = v; return this; }
  withCategory(v: string):         this { this.data.customerCategory = v; return this; }
  withMobile(v: string):           this { this.data.mobileNo1 = v; return this; }
  withEmail(v: string):            this { this.data.emailId = v; return this; }
  withPan(v: string):              this { this.data.pan = v; return this; }
  withRegistrationNo(v: string):   this { this.data.registrationNo = v; return this; }
  withDocUpload(v: string):        this { this.data.docUpload = v; return this; }
  withRelOff(v: string):           this { this.data.relOff = v; return this; }

  build(): CorporateCustomerData { return { ...this.data }; }

  buildMandatoryOnly(): CorporateCustomerData {
    return {
      customerCategory:    '503-COMPANY',
      memberFName:         `CorpMand${RUN}`,
      shortName:           `CM${RUN}`,
      dateOfEstablishment: '01-01-2015',
      registrationNo:      `RMAND${RUN}`,
      taxResidenceStatus:  '1',
      tinAvailable:        'N',
      addressType:         '1',
      address1:            `${RUN} Main Road`,
      pinCode:             '700001',
      countryCode:         'IND',
      stateCode:           'WEST BENGAL',
      mobile1CountryCode:  '+91',
      mobileNo1:           `8${RUN}0001`,
      emailId:             `mand${RUN}@testbank.com`,
      proofType:           '2',
      idNumber:            `8${RUN}000001`,
      issuedDate:          '01-01-2020',
      nameAsInDocument:    `CorpMand${RUN}`,
      recievedDate:        '01-01-2020',
      issuedBy:            '8',
      tdsAvailable:        'N',
    };
  }

  buildSociety(): CorporateCustomerData {
    return { ...this.data, customerCategory: '501-SOCIETY', memberFName: `Society${RUN}`, shortName: `SOC${RUN}`, mobileNo1: `7${RUN}0001`, emailId: `soc${RUN}@testbank.com`, registrationNo: `SREG${RUN}` };
  }

  buildPartnership(): CorporateCustomerData {
    return { ...this.data, customerCategory: '504-PARTNERSHIP FIRM', memberFName: `Partner${RUN}`, shortName: `PF${RUN}`, mobileNo1: `6${RUN}0001`, emailId: `pf${RUN}@testbank.com`, registrationNo: `PREG${RUN}` };
  }

  buildTrust(): CorporateCustomerData {
    return { ...this.data, customerCategory: '505-TRUST', memberFName: `Trust${RUN}`, shortName: `TR${RUN}`, mobileNo1: `5${RUN}0001`, emailId: `tr${RUN}@testbank.com`, registrationNo: `TREG${RUN}` };
  }
}

export class CorporateCustomerValidator {
  validateCreated(toast: string): void {
    expect(toast, 'Success toast must appear after create').toBeTruthy();
  }
  validateApproved(toast: string): void {
    expect(toast, 'Success toast must appear after approve').toBeTruthy();
  }
  validateUpdated(toast: string): void {
    expect(toast, 'Success toast must appear after update').toBeTruthy();
  }
}
