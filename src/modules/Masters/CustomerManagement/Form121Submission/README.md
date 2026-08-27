# Form 121 Submission

**Menu path**: Masters → Customer Management → 15 G/H Submission
**Menu Code**: `15GSUBMISSION`
**Navigation**: `navigate('Masters', 'customermgmt', '15GSUBMISSION')`
**Form URL**: `/d020220Add`
**DB Table**: `D020220`

---

## Files

| File | Purpose |
|------|---------|
| `src/Form121SubmissionPage.ts` | UI interactions — single-page form |
| `src/Form121SubmissionBuilder.ts` | Fluent builder + Validator |
| `src/Form121SubmissionRepository.ts` | SQL queries — D020220 |
| `data/Form121Submission.xlsx` | Test data (Create / Auth / Update / Database sheets) |
| `tests/create.spec.ts` | Create + pending tab verification |
| `tests/authorize.spec.ts` | Checker approves from pending tab |
| `tests/update.spec.ts` | Maker edits authorized record |
| `tests/negative.spec.ts` | Mandatory field + business rule validations |
| `tests/db.spec.ts` | DB state assertions |

---

## Fields (UI Order — confirmed from live CBS DOM)

| # | Field ID | Control | Required | Notes |
|---|----------|---------|----------|-------|
| 1 | `memberCode` | TextInput + Tab | **Mandatory** | Customer ID, maxlength=10, triggers lookup |
| 2 | `memberName` | TextInput | ReadOnly | Auto-populated |
| 3 | `pan` | TextInput | ReadOnly | Auto-populated |
| 4 | `customerCategory` | Select | ReadOnly | Auto-populated |
| 5 | `form121Y`/`form121N` | Radio (Y/N) | **Mandatory** | name=`form121YN` |
| 6 | `isTdsY`/`isTdsN` | Radio (Y/N) | **Mandatory** | name=`tdsYN` |
| 7 | `TDSReason` | Select | Conditional | Enabled when tdsYN=Y |
| 8 | `submitDate` | DateInput | **Mandatory** | dd-MM-yyyy, enabled when form121YN=Y |
| 9 | `assessYear` | TextInput | ReadOnly | Auto-calculated Financial Year |
| 10 | `form121FilledOtherBankY`/`N` | Radio (Y/N) | Optional | name=`form121FilledOtherBankYN` |
| 11 | `NoOf15GH` | TextInput | Conditional | Digits only, maxlength=10 |
| 12 | `amtOf15GHOthBnk_txt` | Amount | Conditional | 2 decimal, hidden=`amtOf15GHOthBnk` |
| 13 | `aggrIncome_txt` | Amount | Optional | Aggregate Income, hidden=`aggrIncome` |
| 14 | `estIncome_txt` | Amount | Optional | Estimated Income, hidden=`estIncome` |
| 15 | `estimatedIncome_txt` | Amount | Optional | hidden=`estimatedIncome` |
| 16 | `prevYearFiled1YN` | Select (Y/N) | Optional | Previous year ITR Year 1 |
| 17 | `prevAssessYear1` | TextInput | Conditional | maxlength=9 |
| 18 | `acknowledgementNo1` | TextInput | Conditional | maxlength=15 |
| 19 | `returnIncome1_txt` | Amount | Conditional | hidden=`returnIncome1` |
| 20 | `prevYearFiled2YN` | Select (Y/N) | Optional | Previous year ITR Year 2 |
| 21 | `prevAssessYear2` | TextInput | Conditional | maxlength=9 |
| 22 | `acknowledgementNo2` | TextInput | Conditional | maxlength=15 |
| 23 | `returnIncome2_txt` | Amount | Conditional | hidden=`returnIncome2` |

---

## TDS Reason Options
`1=REGULAR MEMBER | 4=CHARITY COMMISSIONER CERTIFICATE | 6=OTHER CO-OP BANK DEPOSIT | 7=Form 121 | 9=INCOME TAX AUTHORITY CERTIFICATE | 11=EXEMPT BODIES`

## Business Validations
- Amount of 15GH in other banks must be > 0 when NoOf15GH ≠ 0
- Amount of 15GH in other banks must be 0 when NoOf15GH = 0
- Estimated income must be > (Amount of 15GH in other banks + Aggregate Income)

---

## Key Notes

- `memberCode` must be an existing **authorized** customer
- `assessYear` is auto-calculated — do not fill manually
- `SharedDataStore` key: `Form121Submission.searchKey`
- Save button ID: `#saveD020220` (confirm on actual screen)

---

## ⚠️ Before Running

1. Update `data/Form121Submission.xlsx` → `Create` sheet with a valid `memberCode`
2. Update `Auth` and `Database` sheets with the same `memberCode`

---

## Run

```bash
node scripts/generate-form121-submission-excel.js

npx playwright test src/modules/Masters/CustomerManagement/Form121Submission/tests/
npx playwright test .../create.spec.ts
npx playwright test .../authorize.spec.ts --project=checker
```
