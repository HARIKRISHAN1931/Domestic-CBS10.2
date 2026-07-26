# Customer Creation — Retail

**Menu path**: Masters → Customer Management → Customer Creation-Retail  
**Menu IDs**: `('Masters', 'customermgmt', 'CUSTOMER')`

---

## Files

| File | Purpose |
|------|---------|
| `src/CustomerCreationPage.ts` | UI interactions — 4-tab form (Basic, Contact, Additional, Document) |
| `src/CustomerCreationBuilder.ts` | Fluent test data builder |
| `src/CustomerCreationRepository.ts` | SQL queries — D009011, D010055, D009193 |
| `src/CustomerCreationValidator.ts` | Assertion helpers |
| `data/customer-creation.data.xlsx` | Test data (Create / Auth / Update / Database / Negative sheets) |
| `tests/create.spec.ts` | Create + pending tab verification |
| `tests/authorize.spec.ts` | Checker approves from pending tab |
| `tests/update.spec.ts` | Maker edits authorized record |
| `tests/negative.spec.ts` | Mandatory field validation |
| `tests/db.spec.ts` | DB state assertions |

---

## Excel Sheet Columns

### Create
`customerCategory, customerType, customerBranch, nameTitle, memberFName, memberMName, memberLName, memberDOB, memberGender, nationality, mbrMaritalStatus, residentialStatus, address1, address2, countryCode, stateCode, districtCode, pinCode, mobileNo1, emailId, KYCAvailableYn, occupation, proofType, idNumber, issuedByCountry`

### Auth
`searchKey, tab`

### Update
`searchKey, tab, customerCategory, memberFName, memberLName, memberDOB, mobileNo1, emailId`

### Database
`custNo`

---

## Run

```bash
# Populate Excel
node scripts/setup-customer-creation-excel.js

# Run all specs
npx playwright test src/modules/Masters/CustomerManagement/CustomerCreationretail/tests/

# Individual
npx playwright test .../create.spec.ts
npx playwright test .../authorize.spec.ts --project=checker
```

---

## Key Notes

- `save()` uses `#saveDepositeparamDetails` button (not `#saveCustomer`)
- `openCreateForm()` looks for `#createButton, button.add, #addButton`
- Customer number is extracted from success toast via regex `(\d{5,})`
- `SharedDataStore` key: `CustomerCreation.searchKey`
- DB tables: `D009011` (customer), `D010055` (address), `D009193` (documents)
