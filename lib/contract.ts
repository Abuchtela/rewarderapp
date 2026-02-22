// ── Paycheck Contract — Verified ABI from Remix compilation ─────────────────
// Contract: Paycheck.sol
// Network:  Base (chainId 8453)
// Owner:    abuchtela.base.eth
// Fee:      150 bps = 1.5%
//
// Deploy steps:
//   1. Remix → Compile Paycheck.sol (v0.8.24)
//   2. Deploy & Run → Injected Provider (MetaMask on Base)
//   3. Constructor: _owner = your wallet, _feeBps = 150
//   4. Paste deployed address into NEXT_PUBLIC_PAYCHECK_CONTRACT in Vercel

export const PAYCHECK_ABI = [
  // ── CONSTRUCTOR ────────────────────────────────────────────────────────
  {
    inputs: [
      { internalType: 'address', name: '_owner',  type: 'address'  },
      { internalType: 'uint256', name: '_feeBps', type: 'uint256'  },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },

  // ── CUSTOM ERRORS ──────────────────────────────────────────────────────
  { inputs: [], name: 'FeeTooHigh',     type: 'error' },
  { inputs: [], name: 'NotOwner',       type: 'error' },
  { inputs: [], name: 'TransferFailed', type: 'error' },
  { inputs: [], name: 'ZeroAddress',    type: 'error' },
  { inputs: [], name: 'ZeroValue',      type: 'error' },

  // ── EVENTS ─────────────────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'oldBps', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newBps', type: 'uint256' },
    ],
    name: 'FeeUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: 'address', name: 'to',     type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'FeesWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'oldOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: 'address', name: 'from',      type: 'address' },
      { indexed: true,  internalType: 'address', name: 'builder',   type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount',    type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'fee',       type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'TipSent',
    type: 'event',
  },

  // ── READ FUNCTIONS ─────────────────────────────────────────────────────
  {
    inputs: [],
    name: 'MAX_FEE_BPS',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'builder', type: 'address' }],
    name: 'builderStats',
    outputs: [
      { internalType: 'uint256', name: 'total', type: 'uint256' },
      { internalType: 'uint256', name: 'count', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'builderTipCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'builderTipTotal',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feeBps',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingFees',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalFees',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalVolume',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // ── WRITE FUNCTIONS ────────────────────────────────────────────────────
  {
    inputs: [{ internalType: 'address', name: 'builder', type: 'address' }],
    name: 'tip',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_feeBps', type: 'uint256' }],
    name: 'setFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // ── RECEIVE ────────────────────────────────────────────────────────────
  { stateMutability: 'payable', type: 'receive' },
] as const

// ── CONTRACT ADDRESS ────────────────────────────────────────────────────────
// Paste your Remix-deployed address here after deploying to Base mainnet
export const PAYCHECK_CONTRACT = (
  process.env.NEXT_PUBLIC_PAYCHECK_CONTRACT ?? '0xDA4763E5aECcb3E97AdEc3FB14021510c524145A'
) as `0x${string}`

// ── CHAIN ────────────────────────────────────────────────────────────────────
export const BASE_CHAIN_ID = 8453
export const BASE_RPC      = 'https://mainnet.base.org'
