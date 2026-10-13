# Paycheck / rewarderapp

Farcaster mini app inside BasePulse for live builder reputation and ETH tips on Base.

## Run

Requires Node 22+ and npm. Install with `npm ci`, copy `.env.local.example` to `.env.local`, fill the settings, then run `npm run dev`. Production uses `npm run build` followed by `npm start`.

## Configuration

- `NEYNAR_API_KEY`: server-side user lookup key. Use your own key; rotate any key previously committed to Git. The API supplies the displayed score, username and identity.
- Talent: no API key is required or requested. Talent Protocol announced the closure of its commercial API at the end of August 2026. The app links to the current public-good score calculator at `https://talentprotocol.com/score`, which computes from public data in the browser. Paycheck does not invent or copy an unverified score. Source: https://paragraph.com/@talent/talent-protocol-5-years-building-for-builders
- `NEXT_PUBLIC_FARCASTER_FID` and `NEXT_PUBLIC_PROFILE_ADDRESS`: profile to display outside a Farcaster host. The supplied defaults were checked against the live Neynar profile `abuchtela` on October 13, 2026 UTC. They are lookup identifiers, not proof that a wallet is safe for receiving payments.
- `NEXT_PUBLIC_PAYCHECK_CONTRACT`: a deployed Paycheck contract on Base, not a personal wallet address. Contract data is checked using live RPC before tipping is enabled.
- `NEXT_PUBLIC_OWNER_ADDRESS`: optional expected protocol owner. A mismatch disables payments and deployment from other wallets.
- `BASE_RPC_URL`: server-side Base mainnet RPC. Default: `https://mainnet.base.org`.
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: Coinbase browser/client key if required by the selected wallet services. Never use a server-side CDP signing secret here.
- `NEXT_PUBLIC_URL`: your actual published HTTPS domain.
- `FARCASTER_HEADER`, `FARCASTER_PAYLOAD`, `FARCASTER_SIGNATURE`: domain association generated and signed in the official Farcaster mini app developer tools. The legacy association for `basepulse.manus.space` is preserved outside the public directory for reference only and is never served. Its signature did not pass the live Base verification check and that domain returned HTTP 404. A newly signed association from the official developer tools is required for your actual HTTPS domain. Missing or mismatched settings return HTTP 503. Do not import or share recovery phrases to configure the app.

## Deploy Paycheck

The Stats tab provides a wallet-reviewed deployment of the compiled `contracts/Paycheck.sol` on Base. It sets the connected wallet as protocol owner and a 150 bps (1.5%) initial fee. Deployment requires Base ETH for gas and a wallet signature. After two confirmations, the actual receipt address is saved in this browser and read back from Base. Set `NEXT_PUBLIC_PAYCHECK_CONTRACT` to that verified address in your hosting environment and rebuild to make it the app-wide default.

A tip is simulated before it is submitted. The application displays submitted and confirmed transaction states separately. Fees displayed in the UI come from the contract rather than a fixed claim.

## Data integrity

No fabricated scores, earnings, user counts, ranks, impact metrics, reward allocations, dollar conversions or completed tasks are displayed. Checklist items are self-reported and stored per profile in the local browser. Unsupported notifications return HTTP 503. This app does not automatically obtain grants, claim builder rewards or guarantee income.

## Verification

`npm run contract:compile` regenerates the deployment bytecode from Solidity 0.8.24. `npm run check` checks TypeScript. `npm run build` builds production. `npm test` starts production and checks real HTTP responses, the correct live Neynar profile, live Base rejection of the old EOA, input validation, and unavailable integration states. The live test requires a configured Neynar key and no contract configuration.

Tests do not send funds, deploy a paid contract or prove successful wallet signing. Those require an actual wallet transaction and receipt.
