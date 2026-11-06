# Double Up Navigation Specification

## Status

Approved and locked on 6 November 2026.

This document is the source of truth for the main mobile navigation used by personal accounts, approved agents, and administrators.

## Core navigation rule

Every Double Up bottom navigation bar must contain no more than five buttons.

Bottom navigation is reserved for destinations that users return to regularly. Transaction shortcuts remain in the Home screen quick actions. A shortcut may also appear in bottom navigation when it is important enough to deserve permanent access, but its purpose must remain clear.

Use actual icons with short text labels. Do not use emoji, decorative sparkle icons, or unlabeled navigation icons.

## Personal account navigation

Personal accounts use the following five bottom navigation destinations:

| Position | Destination | Recommended icon | Purpose |
| --- | --- | --- | --- |
| 1 | Home | `home` | Personal balance, quick actions, alerts, and recent activity |
| 2 | Pay | `maximize` | Scan a QR code or enter a payment PIN |
| 3 | Requests | `inbox` | Create, reopen, monitor, reuse, or complete Receive requests |
| 4 | Activity | `clock` | Full transaction history, statuses, and receipts |
| 5 | Profile | `user` | Personal details, verification, security, settings, cards, and approved agent access |

### Personal Home quick actions

The Home screen presents these five transaction shortcuts:

1. Send
2. Pay
3. Receive
4. Deposit
5. Withdraw

History is not a Home quick action because the Activity tab already provides permanent access to transaction history.

Pay appears both as a bottom destination and as a Home shortcut. This duplication is intentional. The bottom destination provides permanent access from anywhere in the personal app, while the Home shortcut provides fast access from the wallet overview.

Receive creates a new Receive request. Requests opens the persistent list of active, reusable, completed, and expired requests.

## Approved agent navigation

An approved agent sees a separate agent navigation configuration only after entering Agent mode with the separate agent PIN.

| Position | Destination | Recommended icon | Purpose |
| --- | --- | --- | --- |
| 1 | Overview | `home` | Operational float, cash drawer, commissions, alerts, and recent agent activity |
| 2 | Deposit | `plus-circle` | Process an agent-assisted deposit into the customer's own wallet |
| 3 | Withdraw | `download` | Scan a withdrawal QR code or enter an amount-specific withdrawal code |
| 4 | Activity | `clock` | Agent transaction history and handover states |
| 5 | Profile | `user` | Agent details, device security, PIN management, and Switch to Personal access |

Agent operational float must never be presented as the agent's personal wallet balance.

The navigation must not expose driver or provider workspaces. People use their personal wallet for different activities. Only an approved agent receives the additional Agent mode described here.

## Administrator navigation

Administrators use a restricted administration interface. Admin access is not offered as an ordinary personal account mode switch.

| Position | Destination | Recommended icon | Purpose |
| --- | --- | --- | --- |
| 1 | Overview | `grid` | Platform status, alerts, pending work, and operational summaries |
| 2 | Users | `users` | Search users, review account state, and manage restrictions |
| 3 | Reviews | `check-square` | Identity reviews and agent approval requests |
| 4 | Transactions | `list` | Transactions, holds, disputes, and investigation details |
| 5 | More | `menu` | Audit logs, test-fund controls, settings, and administrator security |

Administrator actions must be enforced by backend authorization and recorded in audit logs. Hiding a tab in the app is not an authorization control.

## Mode and access rules

1. Personal users see only personal navigation.
2. Approved agents may switch only between Personal and Agent modes.
3. Entering Agent mode requires the separate agent PIN.
4. Leaving Agent mode returns to the personal navigation configuration.
5. Admin access uses a restricted admin session and is not part of the personal or agent mode switcher.
6. The app must not provide a global role or workspace switcher.
7. Navigation visibility must follow backend permissions, but backend permissions remain authoritative.

## Interaction and visual rules

• Keep labels visible under icons.
• Use the shared red active state and grey inactive state.
• Keep each touch target at least 44 by 44 points.
• Use a clean white navigation surface with rounded top or container corners.
• A central item may receive stronger visual emphasis, but it must not become an oversized floating control that competes with the wallet content.
• Preserve the selected tab when returning from a child screen where appropriate.
• Show loading, error, empty, and restricted states inside the destination screen, not through native Android product dialogs.
• Do not display navigation destinations the signed-in account is not authorized to use.

## Current implementation status

The signed-in Personal workspace now uses the approved five-item navigation: Home, Pay, Requests, Activity, and Profile.

The reusable `AppBottomNavigation` component receives a typed navigation configuration rather than hardcoding Personal-only destinations. The same component is intended for future Agent and Admin configurations.

Home includes the approved Send, Pay, Receive, Deposit, and Withdraw shortcuts. Pay opens the Pay destination and Receive opens Requests. Features that still require secure backend operations use a designed Double Up information sheet and do not pretend to move funds.

Agent and Admin navigation configurations are documented but are not implemented yet. Their implementation remains gated by backend authorization, agent approval, separate agent PIN setup, and administrator access controls.

## Recommended code structure

```text
src/
  navigation/
    types.ts
    configs/
      personalNavigation.ts
      agentNavigation.ts
      adminNavigation.ts
    components/
      AppBottomNavigation.tsx
    guards/
      resolveAuthorizedNavigation.ts
```

Navigation configuration should define labels, icons, route identifiers, and capability requirements. Screens should not contain hardcoded role checks for every button.

## Verification checklist

• Personal account shows exactly Home, Pay, Requests, Activity, and Profile.
• Personal Home shows exactly Send, Pay, Receive, Deposit, and Withdraw quick actions.
• Unapproved users cannot see or enter Agent mode.
• Approved agents must enter their separate agent PIN before Agent navigation opens.
• Agent mode shows exactly Overview, Deposit, Withdraw, Activity, and Profile.
• Agent float is labeled separately from personal wallet funds.
• Admin navigation is unavailable to personal and agent sessions.
• Admin mode shows exactly Overview, Users, Reviews, Transactions, and More.
• Every configuration contains five or fewer bottom navigation buttons.
• Unauthorized routes remain blocked even if navigation is manipulated on the client.
