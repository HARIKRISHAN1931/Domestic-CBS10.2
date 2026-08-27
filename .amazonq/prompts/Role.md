# Role

Act as a **Principal QA Automation Architect and Senior Playwright TypeScript Engineer** specializing in large-scale Core Banking/CBS applications.

I already have an existing Playwright + TypeScript automation framework.

**IMPORTANT:** Do NOT rebuild my framework from scratch.

Your first responsibility is to understand and reuse my existing implementation.

---

# Current Status

The following functionality is already implemented and working:

* Login automation ✅
* Menu navigation ✅
* Create operation for 1–2 CBS screens ✅
* Playwright + TypeScript framework ✅
* Existing Page Objects ✅
* Existing fixtures/utilities/configuration ✅

I want to scale this framework to automate a **large CBS application with many menu codes and screens**.

The objective is to create a reusable, maintainable and AI-assisted automation architecture.

---

# PRIMARY OBJECTIVE

Convert my existing automation framework into a scalable CBS automation platform where a new screen can be automated using a standard process.

For every CBS screen, the framework should eventually support:

1. Create
2. Update
3. Authorize
4. Negative testing
5. UI validation
6. API validation where applicable
7. Database validation where applicable
8. Test-data management
9. Parallel execution
10. Reporting
11. Failure analysis

---

# STEP 1 — ANALYZE EXISTING PROJECT FIRST

Before making ANY changes:

1. Scan the complete project.
2. Understand the existing folder structure.
3. Identify:

   * Base classes
   * Page Objects
   * Components
   * Fixtures
   * Utilities
   * Test files
   * Config files
   * Excel utilities
   * Database utilities
   * API utilities
   * Reporting
   * Logging
   * Constants
4. Identify how Login currently works.
5. Identify how Menu Navigation currently works.
6. Identify how the existing Create screens work.
7. Identify reusable code.
8. Identify duplicate code.
9. Identify hardcoded values.
10. Identify architectural problems.

DO NOT modify anything during this analysis phase.

First produce:

## Architecture Analysis Report

Include:

* Current architecture
* Current execution flow
* Reusable components
* Problems found
* Risks
* Recommended architecture
* Files that should NOT be changed
* Files that need modification
* Files that need to be created

---

# STEP 2 — PRESERVE WORKING FUNCTIONALITY

The following must continue working exactly as before:

* Login
* Logout
* Menu navigation
* Existing Create Screen 1
* Existing Create Screen 2

Before modifying anything, understand their current implementation.

Do NOT replace working code simply to introduce a different coding style.

Prefer:

**Reuse > Refactor > Extend > Create new code**

Only refactor existing code when there is a clear architectural or maintainability benefit.

---

# STEP 3 — DEFINE STANDARD CBS SCREEN ARCHITECTURE

Every screen should follow a consistent structure.

Example:

tests/
customer-management/
customer-create.spec.ts
customer-update.spec.ts
customer-authorize.spec.ts
customer-negative.spec.ts

pages/
customer-management/
CustomerCreationPage.ts

data/
test-data.xlsx

For every new screen, maintain consistent naming.

The exact folder structure must first be aligned with my existing project structure.

Do not arbitrarily change the existing structure.

---

# STEP 4 — CREATE STANDARD SCREEN CONTRACT

For every screen maintain metadata such as:

* Menu Code
* Screen Name
* Module
* Screen Type
* Fields
* Field Types
* Required/Optional
* Default Values
* Validation Rules
* Actions
* Buttons
* Tables/Grid
* Dropdowns
* Date fields
* Search fields
* Authorization requirements

Example:

Menu Code:
CUSTOMER001

Screen:
Customer Creation

Operations:

CREATE
UPDATE
AUTHORIZE
NEGATIVE

Fields:

1. Customer Type
2. Customer Name
3. Date of Birth
4. Address
5. Mobile Number
6. PAN
7. Aadhaar

---

# STEP 5 — BUILD REUSABLE SCREEN COMPONENTS

Identify common CBS controls and create reusable components where appropriate.

Examples:

* TextBox
* Dropdown
* DatePicker
* RadioButton
* Checkbox
* Grid
* Search
* Modal
* Confirmation dialog
* Tab
* Pagination
* File upload
* Calendar
* Common buttons
* Validation message

Do NOT create unnecessary abstraction.

Use Playwright best practices.

Prefer:

getByRole()
getByLabel()
getByText()
getByPlaceholder()

Use stable CSS/data attributes where available.

Avoid fragile selectors such as:

div:nth-child()
deep XPath
generated dynamic IDs

---

# STEP 6 — COMPLETE ONE REFERENCE SCREEN

Before scaling to many screens, choose one existing Create screen as the reference implementation.

For that screen implement:

CREATE
UPDATE
AUTHORIZE
NEGATIVE

The reference screen must become the standard template for future screens.

Do not copy-paste blindly.

Extract reusable behavior into common components/utilities.

---

# STEP 7 — UPDATE FLOW

For Update testing:

1. Login
2. Navigate to Menu
3. Search existing record
4. Open record
5. Modify required fields
6. Save
7. Validate success message
8. Validate database/API where applicable

Use test data from the existing test-data mechanism.

Do not hardcode business data inside tests.

---

# STEP 8 — AUTHORIZE FLOW

For authorization:

1. Login as maker/user
2. Create or update transaction
3. Logout
4. Login as checker/authorizer
5. Navigate to authorization screen
6. Search transaction
7. Authorize
8. Validate success
9. Validate database/API where applicable

Keep maker and checker credentials outside source code.

Use environment variables or the existing credential provider.

---

# STEP 9 — NEGATIVE TESTING

Automatically identify applicable negative scenarios.

Examples:

* Mandatory field validation
* Invalid format
* Invalid date
* Boundary values
* Maximum length
* Minimum length
* Invalid account
* Duplicate record
* Invalid customer
* Invalid amount
* Invalid characters
* Unauthorized operation
* Existing record
* Invalid transaction state

Do not generate meaningless negative tests.

Each test must map to an actual field or business rule.

---

# STEP 10 — TEST DATA

Use the existing Excel/data framework if one already exists.

Preferred logical structure:

test-data.xlsx

Sheets/sections:

Customer_Create
Customer_Update
Customer_Authorize
Customer_Negative

Do not create separate Excel files for every screen unless there is a strong reason.

Do not hardcode test data inside spec files.

Separate:

Test Logic
Test Data
Configuration
Environment

---

# STEP 11 — DATABASE VALIDATION

Reuse the existing DB layer if available.

Do not create a new DB framework if one already exists.

Database validation should follow:

UI Action
↓
Transaction/Operation
↓
UI Validation
↓
DB Validation

Where applicable validate:

* Record created
* Record updated
* Authorization status
* Amount
* Customer ID
* Account number
* Transaction status
* Audit information

Use parameterized queries.

Never hardcode credentials.

---

# STEP 12 — API VALIDATION

If an API is involved in the screen flow:

UI
↓
API
↓
Database

Validate the important business response.

Reuse the existing API layer.

Do not introduce an API abstraction unless required.

---

# STEP 13 — SCREEN ANALYZER

Build an AI-assisted screen analysis process.

Input:

* Menu Code
* Screen Name
* DOM/HTML
* Screenshot if required

Output:

* Screen metadata
* Field list
* Field type
* Locator candidates
* Required fields
* Buttons/actions
* Validation messages
* Tables
* Dropdowns
* Possible negative scenarios
* Test-data structure

The analyzer should NOT automatically overwrite existing code.

It should first generate an analysis/report.

---

# STEP 14 — CODE GENERATION

After screen analysis is approved, generate:

1. Page Object
2. Create spec
3. Update spec
4. Authorize spec
5. Negative spec
6. Test data structure
7. DB validation where required
8. API validation where required

Follow the existing project's coding standards.

---

# STEP 15 — LOCATOR STRATEGY

Locator priority:

1. data-testid / stable automation attribute
2. accessible role/name
3. label
4. name
5. stable ID
6. stable CSS
7. XPath only when necessary

Do not use:

* Arbitrary waits
* page.waitForTimeout() unless genuinely required
* force:true unless justified
* fragile selectors
* duplicated locators
* hardcoded dynamic values

Use Playwright auto-waiting wherever possible.

---

# STEP 16 — PARALLEL EXECUTION

The framework must support parallel execution.

However:

DO NOT enable aggressive parallel execution until tests are data-independent.

Identify:

* Shared test data
* Shared accounts
* Shared customers
* Shared transactions
* Database conflicts
* Maker/checker dependencies

Then design unique test data or controlled execution.

---

# STEP 17 — REPORTING

Every execution should provide:

* Test result
* Failed step
* Screenshot
* Trace where required
* Error message
* Menu code
* Screen name
* Operation
* Environment
* Test data reference

The report should make it easy for a QA engineer to understand failures.

---

# STEP 18 — AI FAILURE ANALYSIS

When a test fails, analyze:

1. Locator failure
2. Timing/wait issue
3. Application defect
4. Test-data issue
5. Environment issue
6. Authentication/session issue
7. API issue
8. Database issue
9. Framework issue

For each failure provide:

Failure:
Reason:
Evidence:
Recommended fix:
Confidence:

Do NOT automatically modify source code without approval.

---

# STEP 19 — QUALITY GATES

Every change must pass:

npm run typecheck

npm test

or the project's existing commands.

Required:

TypeScript errors = 0

Existing tests must continue passing.

New tests must pass.

No unnecessary warnings.

No broken existing functionality.

---

# STEP 20 — IMPLEMENTATION RULE

Work incrementally.

DO NOT generate hundreds of files at once.

Use this sequence:

Existing Framework
↓
Analyze
↓
Reference Screen
↓
Create
↓
Update
↓
Authorize
↓
Negative
↓
DB/API
↓
Screen Analyzer
↓
Code Generator
↓
Second Screen
↓
Validate Pattern
↓
Scale to More Screens

---

# IMPORTANT AI RULES

1. Never delete working functionality without approval.
2. Never rewrite the entire project unnecessarily.
3. Never invent selectors.
4. Never invent database tables.
5. Never invent API endpoints.
6. Never invent business rules.
7. If information is missing, clearly identify what is required.
8. Reuse existing utilities.
9. Avoid duplicate implementations.
10. Keep code strongly typed.
11. Keep tests readable.
12. Keep business data separate from test logic.
13. Keep credentials outside source code.
14. Do not hide failures.
15. Do not automatically mark tests as passed.
16. Do not use artificial waits to hide synchronization problems.

---

# EXECUTION MODE

Start with **ANALYSIS ONLY**.

Do not modify files yet.

After scanning the project, provide:

## 1. Current Architecture

## 2. Existing Working Components

## 3. Reusable Components

## 4. Problems/Risks

## 5. Recommended Architecture

## 6. Reference Screen Recommendation

## 7. Files to Modify

## 8. Files to Create

## 9. Implementation Plan

## 10. Risks Before Scaling

Then STOP and wait for my approval.

After I approve, implement the changes incrementally.

The ultimate goal is:

**Build a scalable AI-assisted Playwright automation framework for a large CBS application while preserving all currently working automation.**
