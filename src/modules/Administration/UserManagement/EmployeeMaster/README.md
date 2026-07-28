# Employee Master (EMPLOYEEMST)

**Menu path**: Administration → User Management → Employee Master  
**Menu code**: `EMPLOYEEMST`

## Structure

```
EmployeeMaster/
├── data/
│   └── employee-master.data.xlsx   # Sheets: Create, Update, Authorize, Negative, Database
├── src/
│   ├── EmployeeMasterPage.ts       # UI interactions
│   ├── EmployeeMasterBuilder.ts    # Test data builder + validator
│   └── EmployeeMasterRepository.ts # DB queries (EMPLOYEEMASTER table)
└── tests/
    ├── create.spec.ts
    ├── update.spec.ts
    ├── authorize.spec.ts
    ├── negative.spec.ts
    └── db.spec.ts
```

## Fields

| Field | Type | Notes |
|-------|------|-------|
| employeeId | text | Primary key |
| employeeName | text | Mandatory |
| designation | dropdown | |
| department | dropdown | |
| branchCode | dropdown | |
| dateOfJoining | date | dd-MM-yyyy |
| dateOfBirth | date | dd-MM-yyyy |
| gender | dropdown | M/F |
| mobileNo | text | 10 digits |
| emailId | text | |
| address | text | |
| city | text | |
| state | dropdown | |
| pinCode | text | 6 digits |
| panNo | text | |
| aadharNo | text | 12 digits |
| employeeStatus | dropdown | A=Active |
| reportingManager | dropdown | |
| grade | dropdown | |
| category | dropdown | |

## Run

```bash
# Generate Excel
node scripts/setup-employee-master-excel.js

# Run tests
npx playwright test src/modules/Administration/UserManagement/EmployeeMaster
```
