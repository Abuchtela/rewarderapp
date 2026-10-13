import { NextRequest } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'
import { PAYCHECK_ABI } from '@/lib/contract'
import { CONTRACT_ADDRESS, OWNER_ADDRESS, validAddress } from '@/lib/settings'

export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('contract')
  const address = raw ? validAddress(raw) : CONTRACT_ADDRESS
  if (raw && !address) return Response.json({ error: 'Invalid contract address' }, { status: 400 })
  if (!address) return Response.json({ status: 'not_configured', ready: false })
  const client = createPublicClient({ chain: base, transport: http(process.env.BASE_RPC_URL ?? 'https://mainnet.base.org', { timeout: 12000, retryCount: 0 }) })
  try {
    const blockNumber = await client.getBlockNumber()
    const code = await client.getCode({ address, blockNumber })
    if (!code || code === '0x') return Response.json({ status: 'not_a_contract', ready: false, address })
    const read = (functionName: 'owner' | 'feeBps' | 'totalVolume' | 'totalFees' | 'pendingFees') => client.readContract({ address, abi: PAYCHECK_ABI, functionName, blockNumber })
    const [owner, feeBps, totalVolume, totalFees, pendingFees] = await Promise.all([read('owner'), read('feeBps'), read('totalVolume'), read('totalFees'), read('pendingFees')])
    if (typeof owner !== 'string' || typeof feeBps !== 'bigint' || feeBps > 500n) return Response.json({ status: 'invalid_contract', ready: false })
    const ownerMatches = !OWNER_ADDRESS || owner.toLowerCase() === OWNER_ADDRESS.toLowerCase()
    return Response.json({ status: ownerMatches ? 'live' : 'owner_mismatch', ready: ownerMatches,
      address, owner, feeBps: Number(feeBps), totalVolume: formatEther(totalVolume as bigint),
      totalFees: formatEther(totalFees as bigint), pendingFees: formatEther(pendingFees as bigint),
      blockNumber: blockNumber.toString(), fetchedAt: new Date().toISOString(),
    })
  } catch { return Response.json({ status: 'rpc_or_contract_error', ready: false }, { status: 502 }) }
}
