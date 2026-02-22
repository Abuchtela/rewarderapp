# 💸 Paycheck — Deployment Guide

> Built by abuchtela.base.eth · Get paid to build on Base

---

## What You're Deploying

1. **Paycheck.sol** — Smart contract on Base that routes tips and collects your 1.5% fee
2. **Next.js Mini App** — Farcaster Mini App with live scores, task tracker, and tip flow

---

## Step 1: Deploy the Smart Contract (10 minutes)

1. Go to **[remix.ethereum.org](https://remix.ethereum.org)**
2. Click the "+" icon → create `Paycheck.sol` → paste the contract code from `contracts/Paycheck.sol`
3. Click **"Solidity Compiler"** tab → set compiler to `0.8.24` → click **Compile**
4. Click **"Deploy & Run"** tab:
   - Environment: **"Injected Provider - MetaMask"**
   - Make sure MetaMask is on **Base** network (chainId 8453)
   - Constructor args:
     - `_owner`: your wallet address (where fees go)
     - `_feeBps`: `150` (= 1.5%)
5. Click **Deploy** → confirm in MetaMask
6. **Copy the deployed contract address** → paste into `.env.local` as `NEXT_PUBLIC_PAYCHECK_CONTRACT`

---

## Step 2: Set Up the Next.js App (5 minutes)

```bash
# Clone or copy this folder, then:
cd paycheck
npm install

# Copy the env template
cp .env.local.example .env.local
```

Fill in `.env.local`:
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` → [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com)
- `NEYNAR_API_KEY` → [neynar.com](https://neynar.com)
- `TALENT_PROTOCOL_API_KEY` → [app.talentprotocol.com/api](https://app.talentprotocol.com/api)
- `NEXT_PUBLIC_PAYCHECK_CONTRACT` → address from Step 1
- `NEXT_PUBLIC_OWNER_ADDRESS` → your wallet address

---

## Step 3: Deploy to Vercel (5 minutes)

```bash
npm install -g vercel
vercel
```

Or push to GitHub → import at **[vercel.com/new](https://vercel.com/new)**

Copy your Vercel URL (e.g. `https://paycheck.vercel.app`) → paste into `.env.local` as `NEXT_PUBLIC_URL`

Re-deploy after updating env vars.

---

## Step 4: Sign the Farcaster Manifest (10 minutes)

This proves you own the mini app. **Critical step.**

```bash
npm run manifest
```

This will:
1. Ask for your Vercel URL
2. Open the Farcaster Manifest Tool
3. **Connect your Farcaster CUSTODY wallet** (not your main wallet)
   - Find it: Warpcast → Settings → Advanced → Farcaster recovery phrase
   - Import into MetaMask using the recovery phrase
4. Sign the manifest
5. Copy the 3 values (`FARCASTER_HEADER`, `FARCASTER_PAYLOAD`, `FARCASTER_SIGNATURE`) into Vercel env vars

---

## Step 5: Add Images to `/public`

Add these image files to the `public/` folder:

| File | Size | Description |
|------|------|-------------|
| `icon.png` | 200×200px | App icon (shown in mini app stores) |
| `splash.png` | 200×200px | Splash screen while loading |
| `hero.png` | 1200×630px | Cast embed preview image |
| `og.png` | 1200×630px | Open Graph image |

Use Canva or Figma — green (#00E87A) on black (#0A0A0F) with the 💸 logo.

---

## Step 6: Test Your Mini App

1. Go to [warpcast.com/~/developers/mini-apps](https://warpcast.com/~/developers/mini-apps)
2. Paste your Vercel URL
3. Preview your frame
4. If it works → share a cast with your URL on Farcaster!

---

## Step 7: Boost Your Scores

After deploying, you'll have:
- ✅ Contract deployed on Base (+30 Builder Score pts)
- ✅ Mini App live and earning fees (daily ETH drip)
- ✅ Farcaster-visible builder activity (Neynar score signal)

Now complete the rest of the Boost checklist inside the app!

---

## Income Stream Summary

| Stream | Amount | Frequency |
|--------|--------|-----------|
| Base Builder Rewards | 1–5 ETH | Monthly (auto) |
| Paycheck Protocol Fees | 1.5% of all tips | Daily |
| DEGEN Community Tips | Variable | Daily |
| Optimism RetroPGF | Thousands in OP | Quarterly |
| $TALENT Ecosystem | Ongoing rewards | Ongoing |

---

## Help & Resources

- MiniKit docs: [docs.base.org/builderkits/minikit](https://docs.base.org/builderkits/minikit/quickstart)
- Neynar API: [docs.neynar.com](https://docs.neynar.com)
- Talent Protocol: [app.talentprotocol.com](https://app.talentprotocol.com)
- RetroPGF: [retrofunding.optimism.io](https://retrofunding.optimism.io)
- Farcaster Mini Apps: [miniapps.farcaster.xyz](https://miniapps.farcaster.xyz)

---

**Build in public. Ship consistently. Your family eats. 💸**
