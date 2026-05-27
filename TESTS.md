# Automated Tests

This document lists the automated tests written for the SpendScope audit engine.

## Test Suite Details
- **Test File:** [auditEngine.test.ts](file:///d:/Spendlytics/frontend/src/lib/auditEngine.test.ts)
- **Framework:** Vitest (Vite-native testing framework)

## Test Cases

### 1. should downgrade Claude Max to Pro for a single user
- **Objective:** Verifies that a single-seat team on the expensive Claude Max tier ($100/mo) is recommended to downgrade to Claude Pro ($20/mo).
- **Assertion:** Expects a savings recommendation of $80/mo.

### 2. should keep an optimal stack without unnecessary changes
- **Objective:** Verifies that a user already on an optimal plan (such as a single Claude Pro seat at $20/mo) is left alone and receives a "keep" recommendation.
- **Assertion:** Expects $0 monthly savings and "optimal" tier flag.

### 3. should flag overlapping Copilot redundant usage if Cursor is present
- **Objective:** Checks cross-tool redundancy. If both GitHub Copilot and Cursor are enabled for coding, Copilot should be flagged as redundant.
- **Assertion:** Expects a warnings reasoning explaining potential duplicate subscriptions.

### 4. should downgrade ChatGPT Team to Plus if there are only 2 seats
- **Objective:** Verifies team plan validation logic. Since ChatGPT Team has a 2-seat minimum but offers the same models as ChatGPT Plus at similar pricing, we recommend Individual Plus plans for small teams to avoid unnecessary workspace overhead.
- **Assertion:** Expects the target recommendation to suggest individual Plus plans.

### 5. should optimize direct API spend if it exceeds $200/mo
- **Objective:** Verifies direct LLM API spend logic. If a developer's API spend exceeds $200/mo, we suggest optimizing usage (like implementing prompt caching or model routing).
- **Assertion:** Expects an "optimize" recommendation with a 30% savings calculation.

---

## How to Run the Tests

To execute the automated unit tests locally:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Run the test suite:
   ```bash
   npm run test
   ```

This will run the Vitest suite in single-run mode and output the results.
