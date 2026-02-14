# Survivor Guard

**Transaction Risk Intelligence for Solana Mobile**

Survivor Guard is a mobile-first transaction security layer that intercepts and evaluates Solana transactions before signing, protecting users from phishing, scams, and rug pulls.

Built with Mobile Wallet Adapter (MWA) for the Solana Mobile Hackathon 2026.

## How It Works

1. **Preflight Scanner** — Paste any URL, contract address, or message to get an instant risk assessment
2. **Risk Engine** — 10 deterministic rules evaluate transactions with no AI, no black boxes
3. **Intercept Flow** — HIGH RISK triggers abort/proceed decision before wallet signs

## Risk Signals Detected

- Unverified program interactions
- Large SOL transfers
- Complex multi-instruction transactions
- Domain impersonation (brand lookalikes)
- Scam language patterns (claim, airdrop, free mint, verify wallet)
- Token age, liquidity depth, deployer history

## Tech Stack

- React Native + Expo SDK 52
- Mobile Wallet Adapter (@wallet-ui/react-native-kit)
- Solana Web3.js
- TypeScript
- Deterministic scoring engine (no ML dependencies)

## Risk Scoring

| Level | Score | Action |
|-------|-------|--------|
| LOW | 0-24 | "Looks Safe" — proceed |
| MED | 25-54 | "Review & Proceed" — caution |
| HIGH | 55-100 | "Abort Transaction" — block with override option |

## Build & Run
```bash
npm install
npx expo run:android --variant release
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Architecture
```
app/index.tsx              — Main UI (Home → Scanner → Result screens)
features/survivor/
  risk-engine.ts           — Deterministic risk scoring engine
```

## Philosophy

**Logic-first. Reality-first.** Every risk signal is auditable. Every score is explainable. No black-box AI. No trust assumptions. The engine tells you exactly why a transaction is dangerous.

## License

MIT

---

*MONOLITH · Survivor Guard v0.1*
