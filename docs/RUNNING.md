# Double Up Running and Verification Guide

## Current project location

```text
C:\Users\tlhab\Downloads\PulaPay\PulaPay
```

## Requirements

The current project requires:

• Node.js
• npm
• Expo tooling compatible with the project version
• Android tooling for native Android verification
• A connected Android device or emulator for native testing

The project currently uses Expo SDK 58 according to `package.json`. Expo and React Native commands must be checked against the installed project versions before changes are made.

## Install dependencies

From the project directory:

```text
npm install
```

## Start the development server

```text
npm run start
```

## Run on Android

```text
npm run android
```

The project also contains a PowerShell launcher:

```text
.\scripts\pulapay.ps1 run
```

The launcher currently uses the historical PulaPay name and must be reviewed when the product configuration changes to Double Up.

## Run on web

```text
npm run web
```

Web behavior must not be treated as proof that native storage, native permissions, or native UI behavior works.

## Type checking

```text
npm exec tsc -- --noEmit
```

The type check was run during the initial review and returned no reported errors.

## Verification checklist

Before considering a change complete:

• Start the app from a clean process.
• Verify the changed screen on the intended platform.
• Test the successful path.
• Test invalid input.
• Test a network or backend failure where relevant.
• Test repeated taps.
• Confirm the error and success states are clear.
• Confirm data persists after reopening the app.
• Confirm unauthorized access is rejected.
• Run type checking.
• Update `memory.md`.

## Current limitation

The current application is still a local frontend prototype. Backend environment setup, authentication configuration, database migrations, and production like test users have not yet been implemented.

