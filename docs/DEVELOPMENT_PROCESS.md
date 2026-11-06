# Double Up Development Process

## Purpose

This document explains how Double Up should be developed and maintained. It is written for anyone who needs to understand the project without relying on private conversation history.

## Development principles

Double Up should be developed as a real connected prototype using persistent test funds. A screen that changes a local number is not considered a completed financial flow.

Every important user action should have:

• A clear starting state
• Loading feedback
• Validation
• A clear success state
• A clear failure state
• A safe retry path
• A durable backend result when the action changes money or permissions

## Approval process

Every major change must be presented to the user before implementation.

The proposal should explain:

• What will change
• Why it is needed
• Which files and services will be affected
• What user behavior will change
• What security implications exist
• How the change will be tested
• What alternatives were considered

Implementation should start only after the user approves the proposal.

## Development stages

### Stage 1: Understand

Read the relevant product specification, current code, existing documentation, and related reference projects.

Record the current behavior before changing it.

### Stage 2: Decide

Describe the proposed design and identify decisions that affect the database, authentication, money movement, permissions, UI structure, or external services.

Ask for approval for major decisions.

### Stage 3: Structure

Create or update the code structure before adding large behavior. Keep screens, components, business features, backend services, types, and utilities separate.

### Stage 4: Implement

Implement one narrow end to end flow at a time. A flow should include its interface, backend operation, validation, error handling, success handling, and tests where appropriate.

### Stage 5: Verify

Run type checking, tests, linting when available, and real app interaction for the changed flow. Verify both success and failure paths.

### Stage 6: Document

Update `memory.md` and the relevant technical document with files changed, behavior added, verification completed, and remaining work.

## Recommended first implementation slice

The first slice should be the Double Up foundation:

1. Double Up startup screen
2. Welcome screen
3. Registration
4. Login
5. Session restoration
6. Logout
7. User profile creation
8. One personal wallet per user
9. Personal wallet dashboard

This slice should use the backend and should be verified with users created through the real registration process.

## Recommended financial flow order

After the foundation is complete:

1. Send Money between two registered users
2. Personal activity and receipts
3. Receive request with QR and six digit payment PIN
4. Pay using QR or payment PIN
5. Complete or Reuse receive requests
6. Agent approval and agent PIN setup
7. Agent deposits
8. Agent withdrawals using code or QR
9. Notifications
10. ID upload and admin review

Send Money should come before QR payments because QR payments should reuse the same secure backend transfer logic.

## UI implementation standard

The interface should use the Double Up design system rather than native Android product dialogs.

Use:

• Actual icons
• Custom buttons
• Custom cards
• Custom modal sheets
• Liquid Glass visual treatment
• FlatList for repeated content
• Custom loading indicators
• Custom error and success states
• Purposeful success animations

Do not use emoji characters as icons. Do not use sparkle characters as decoration. Do not rely on default Android alerts for normal product behavior.

Main navigation must follow `NAVIGATION.md`. Every bottom navigation configuration has a maximum of five destinations. Transaction shortcuts and persistent destinations must remain separate concepts unless the navigation specification explicitly approves duplication.

## Security process

Security must be considered before implementing any flow that touches:

• Authentication
• PINs
• Wallet balances
• Transaction posting
• Agent access
• QR codes
• Payment PINs
• Identity documents
• Notifications
• Admin actions

The client must never be the authority for balances, permissions, or transaction completion.

Sensitive values must not be stored in plain text. Server side authorization, database rules, input validation, idempotency, and audit records are required for financial operations.

## Verification standard

For each completed flow, verify:

• The correct screen opens
• Valid input succeeds
• Invalid input gives a useful error
• Loading is visible during network work
• Repeated taps do not duplicate the operation
• The backend result is authoritative
• The user can recover from failure
• Data remains after closing and reopening the app
• Unauthorized users cannot access the flow
• The progress record is updated

## Progress recording

After every approved major change, update `memory.md` with:

• Date
• Approved scope
• User visible behavior
• Backend or API changes
• Files changed
• Verification performed
• Known limitations
• Next proposed step

