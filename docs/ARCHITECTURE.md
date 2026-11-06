# Double Up Architecture and Code Structure

## Architecture goal

Double Up should be understandable to a new developer. A developer should be able to find the screen, the user flow, the API call, the data type, and the backend rule without searching through one large application file.

The UberClone project is used as a quality reference for separation between screens, components, navigation, and backend operations. Double Up should use this principle with a modern Expo and TypeScript structure.

## Planned source structure

```text
src/
  app/
    App.tsx
  navigation/
    configs/
    components/
    guards/
  screens/
    startup/
    auth/
    wallet/
    receive/
    pay/
    activity/
    profile/
    agent/
  components/
    common/
    wallet/
    transactions/
    forms/
    modals/
  features/
    auth/
    wallet/
    payments/
    receiveRequests/
    deposits/
    withdrawals/
    agent/
  services/
    auth/
    wallet/
    payments/
    notifications/
    storage/
  hooks/
  types/
  utils/
  constants/
  config/

supabase/
  migrations/
  functions/
  seed/
```

## Responsibility of each area

### App and navigation

The app entry point should configure providers and navigation. It should not contain wallet calculations or transaction rules.

The approved navigation destinations, role-specific configurations, quick actions, and access rules are defined in `NAVIGATION.md`. Navigation should use shared configuration objects for Personal, Agent, and Admin interfaces. Backend authorization remains authoritative even when a destination is hidden in the client.

### Screens

Screens compose components and connect user actions to feature hooks. Screens should not directly contain database queries when a feature service can own that behavior.

### Components

Components are reusable visual pieces such as wallet cards, transaction rows, modal sheets, buttons, inputs, status banners, and loading states.

### Features

Features contain user flows and business behavior. A receive request feature should own request creation, completion, reuse, and display state.

### Services

Services communicate with the backend and external systems. They should return typed results and consistent errors.

### Hooks

Hooks connect screens to feature state and services. They should not hide important business rules from the feature layer.

### Types

Types define users, wallets, transactions, payment requests, agent accounts, notifications, API responses, and errors.

### Utilities

Utilities contain small reusable functions such as phone normalization, currency formatting, date formatting, and request validation.

### Supabase

Database migrations define persistent data. Edge functions or secure database functions handle operations that require atomic posting, authorization, or privileged behavior.

## State ownership

Use local component state for temporary visual state such as:

• Whether a modal is open
• Current text input
• Selected tab
• Animation state

Use feature hooks for flow state such as:

• Registration progress
• Payment request status
• Agent handover state
• Loading and error state

Use the backend for authoritative state such as:

• User identity
• Wallet ownership
• Balances
• Transactions
• Agent approval
• Payment request status
• Notifications

## Financial rule

The mobile client must request financial operations. It must not decide whether they are valid or directly update authoritative balances.

The backend must validate permissions, balances, request states, idempotency keys, and transaction limits before posting ledger entries.

