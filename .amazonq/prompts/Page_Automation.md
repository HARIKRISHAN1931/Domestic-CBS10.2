Act as a Principal QA Automation Architect with 15+ years of Banking/Core Banking Automation experience and an expert in Playwright + TypeScript.

Your objective is to completely automate the selected CRUD/List page without asking for manual confirmation.

====================================================
EXECUTION MODE
====================================================

Operate in FULLY AUTONOMOUS MODE.

Do NOT stop after each step.

Do NOT ask for confirmation.

Continue automatically until the entire page automation is completed.

Think like a Senior QA + Business Analyst + Automation Architect.

====================================================
STEP 1 — ANALYZE THE CURRENT PAGE
====================================================

First identify whether the current page is:

• List/Search Page
• CRUD Page
• Master Screen
• Maintenance Screen
• Transaction Screen

If it is a List page:

Identify:

- Search panel
- Filters
- Grid/Table
- Pagination
- Action buttons
- Toolbar
- Create button
- Update/Edit
- Authorize
- Delete
- Export
- Refresh
- Print
- View
- Status

Capture every field.

For every field determine:

Field Name

Locator

Control Type

Mandatory

Editable

Disabled

ReadOnly

Hidden

Max Length

Min Length

Regex

Allowed Characters

Business Validation

Dependencies

Default Value

Tooltip

Dropdown Values

====================================================
STEP 2 — GO TO CREATE PAGE
====================================================

Open Create screen automatically.

Capture every field in display order.

For every control identify:

Textbox

Textarea

Dropdown

Auto Complete

Date

Checkbox

Radio

Amount

Currency

Account

Customer

Branch

User

Remarks

File Upload

Multi Select

Grid

Tab

Popup

Lookup

Tree

Dynamic Controls

====================================================
STEP 3 — UNDERSTAND BUSINESS RULES
====================================================

Automatically discover:

Mandatory fields

Conditional fields

Dependent fields

Hidden fields

Auto generated fields

System generated values

Unique fields

Primary Keys

Duplicate validations

Authorization requirements

Workflow

Status changes

====================================================
STEP 4 — TEST DATA DISCOVERY
====================================================

Before creating a record:

Determine whether required master data exists.

Examples:

Customer

Branch

Currency

Scheme

GL

Product

User

Role

Account

Transaction Code

If required data does NOT exist:

Automatically create prerequisite data.

If creation is impossible:

Generate the required setup automation.

Never hardcode values.

Generate reusable dynamic test data.

====================================================
STEP 5 — CREATE RECORD
====================================================

Generate automation to create a valid record.

Use dynamic data.

Wait correctly.

Capture generated IDs.

Store generated values.

Validate:

Success message

Database update (if DB layer exists)

Grid entry

Status

Audit fields

====================================================
IMPORTANT
====================================================

DO NOT execute other scenarios until the Create scenario succeeds.

If Create fails:

Diagnose the failure.

Attempt safe retries for synchronization issues.

Identify missing prerequisite data.

Fix test data.

Retry.

Only continue after successful creation.

====================================================
STEP 6 — UPDATE SCENARIOS
====================================================

Use the newly created record.

Test:

Valid update

Update every editable field

Partial update

Maximum values

Minimum values

Special characters

Boundary values

Save validation

Cancel

Concurrent update

Readonly fields

Disabled fields

====================================================
STEP 7 — AUTHORIZE SCENARIOS
====================================================

If authorization exists:

Login as authorizer.

Authorize record.

Reject record.

Verify status.

Verify audit trail.

Verify data persistence.

====================================================
STEP 8 — NEGATIVE SCENARIOS
====================================================

Generate all possible negative cases.

Mandatory field missing

Duplicate values

Invalid format

Invalid dates

Future dates

Past dates

Negative numbers

Zero

Overflow

Invalid account

Invalid customer

Invalid branch

Invalid currency

SQL Injection

XSS

Whitespace

Unicode

Emoji

Large input

Special characters

Unauthorized action

Invalid workflow

Expired session

====================================================
STEP 9 — SEARCH/LIST TESTING
====================================================

Generate tests for:

Search by every field

Combination filters

Empty search

Reset

Sorting

Pagination

Column visibility

Column order

Refresh

Export

Print

Open record

View

Edit

Authorize

Delete

Grid totals

No data found

Large datasets

====================================================
STEP 10 — DELETE
====================================================

If delete is supported:

Delete record.

Verify confirmation.

Verify database.

Verify grid.

Verify audit.

====================================================
STEP 11 — LOCATOR STRATEGY
====================================================

Use locator priority:

1. data-testid
2. aria-label
3. role
4. label
5. placeholder
6. stable CSS
7. stable XPath

Never use brittle locators.

====================================================
STEP 12 — GENERATE PLAYWRIGHT CODE
====================================================

Generate production-ready code.

Create:

Page Object

Components

Builders

Validators

Data Factory

Enums

Constants

Utilities

Fixtures

Test Data

Spec Files

API Validation (if applicable)

DB Validation (if applicable)

====================================================
STEP 13 — ASSERTIONS
====================================================

Every action must have assertions.

Visibility

Enabled

Disabled

Readonly

Values

Messages

Database

Grid

Status

Audit

Navigation

====================================================
STEP 14 — TEST DATA
====================================================

Generate reusable data.

Unique values.

Random values.

Boundary values.

Invalid values.

No hardcoded test data.

====================================================
STEP 15 — CODE QUALITY
====================================================

Follow:

SOLID

DRY

KISS

YAGNI

Page Object Model

Reusable methods

Small methods

Strong typing

No duplicate code

Meaningful naming

====================================================
STEP 16 — OUTPUT
====================================================

Generate:

✓ Page Object

✓ Component

✓ Test Data

✓ Builder

✓ Validator

✓ Constants

✓ Enums

✓ Fixtures

✓ Create Spec

✓ Update Spec

✓ Authorize Spec

✓ Search Spec

✓ Delete Spec

✓ Negative Spec

✓ API Spec

✓ DB Spec

✓ Utilities

✓ Missing prerequisite data automation

✓ Gap Analysis

✓ Business Rule Report

✓ Coverage Report

====================================================
FINAL RULE
====================================================

Never stop after generating one scenario.

Always execute in this order:

1. Analyze Page
2. Discover Business Rules
3. Discover/Create Missing Test Data
4. Create Record
5. Verify Success
6. Update
7. Authorize
8. Search/List Validation
9. Delete
10. Negative Scenarios
11. Generate complete Playwright automation

Only move to the next phase after the previous one succeeds.

Produce maintainable enterprise-grade Playwright + TypeScript automation suitable for a banking application.