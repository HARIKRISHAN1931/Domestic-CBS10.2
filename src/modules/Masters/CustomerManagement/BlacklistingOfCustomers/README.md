# Blacklisting Of Customers

**Menu path**: Masters → Customer Management → Blacklisting Of Customers
**Menu IDs**: `navigate('Masters', 'customermgmt', 'CUSTBLACKLIST')`

---

## Files

| File | Purpose |
|------|---------|
| `src/BlacklistingOfCustomersPage.ts` | UI interactions — single-page form |
| `src/BlacklistingOfCustomersBuilder.ts` | Fluent builder + Validator + DB row interface |
| `src/BlacklistingOfCustomersRepository.ts` | SQL queries — custBlacklistMaster |
| `data/BlacklistingOfCustomers.xlsx` | Test data (Create / Auth / Update / Database sheets) |
| `tests/create.spec.ts` | Create + pending tab verification |
| `tests/authorize.spec.ts` | Checker approves from pending tab |
| `tests/update.spec.ts` | Maker edits authorized record |
| `tests/negative.spec.ts` | Mandatory field + invalid customer validations |
| `tests/db.spec.ts` | DB state assertions |

---

## Excel Sheet Columns

### Create
`custNo, blacklistReason, blacklistDate, remarks`

### Auth
`searchKey, tab`

### Update
`searchKey, tab, blacklistReason, remarks`

### Database
`custNo`

---

## Fields (UI Order)

| # | Field | Control | Required |
|---|-------|---------|----------|
| 1 | Customer Number | TextInput + Tab trigger | **Mandatory** |
| 2 | Blacklist Reason | Select | **Mandatory** |
| 3 | Blacklist Date | DateInput (dd-MM-yyyy) | **Mandatory** |
| 4 | Remarks | TextInput | Optional |

---

## Key Notes

- `custNo` must be an existing **authorized** customer number
- Customer name auto-populates after Tab on `custNo`
- Save button ID: `#saveBlacklist` or `#saveCustBlacklist` (confirm on actual screen)
- `SharedDataStore` key: `BlacklistingOfCustomers.searchKey`
- DB table: `custBlacklistMaster` (confirm actual table name on screen)

---

## Run

```bash
# Generate Excel
node scripts/generate-blacklisting-customers-excel.js

# Run all specs
npx playwright test src/modules/Masters/CustomerManagement/BlacklistingOfCustomers/tests/

# Individual
npx playwright test .../create.spec.ts
npx playwright test .../authorize.spec.ts --project=checker
```

---

## ⚠️ Before Running

1. Open the screen in CBS and confirm:
   - Actual menu ID (verify `CUSTBLACKLIST`)
   - Save button ID
   - Customer Number field ID (`custNo` / `customerNo` / `customerId`)
   - Blacklist Reason dropdown values
   - DB table name (`custBlacklistMaster`)
2. Update `data/BlacklistingOfCustomers.xlsx` → `Create` sheet with a valid `custNo`
