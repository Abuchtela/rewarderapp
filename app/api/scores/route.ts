import { NextRequest } from 'next/server'
import { validAddress } from '@/lib/settings'

export const dynamic = 'force-dynamic'
async function readApi(url: string, key: string | undefined, header: string) {
  if (!key) return { data: null, status: 'not_configured' }
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json', [header]: key },
      signal: AbortSignal.timeout(12000), cache: 'no-store',
    })
    if (!response.ok) return { data: null, status: `upstream_${response.status}` }
    return { data: await response.json(), status: 'live' }
  } catch { return { data: null, status: 'unavailable' } }
}
export async function GET(req: NextRequest) {
  const fid = req.nextUrl.searchParams.get('fid')
  const address = req.nextUrl.searchParams.get('address')
  if (!fid && !address) return Response.json({ error: 'Provide fid or address' }, { status: 400 })
  if ((fid && !/^[1-9]\d{0,14}$/.test(fid)) || (address && !validAddress(address))) {
    return Response.json({ error: 'Invalid fid or wallet address' }, { status: 400 })
  }
  const [neynar, talent] = await Promise.all([
    fid ? readApi(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, process.env.NEYNAR_API_KEY, 'api_key') : Promise.resolve({ data: null, status: 'not_requested' }),
    address ? readApi(`https://api.talentprotocol.com/score?account_source=wallet&account_id=${encodeURIComponent(address)}`, process.env.TALENT_PROTOCOL_API_KEY, 'X-API-KEY') : Promise.resolve({ data: null, status: 'not_requested' }),
  ])
  const user = neynar.data?.users?.[0]
  const score = talent.data?.score
  return Response.json({
    neynar: user ? {
      fid: user.fid, username: user.username, displayName: user.display_name,
      neynarScore: typeof user.score === 'number' ? user.score : null,
      walletAddress: user.verified_addresses?.primary?.eth_address ?? null,
    } : null,
    talent: score && typeof score.points === 'number' ? { builderScore: score.points } : null,
    status: {
      neynar: neynar.status === 'live' && !user ? 'not_found' : neynar.status,
      talent: talent.status === 'live' && typeof score?.points !== 'number' ? 'invalid_response' : talent.status,
    }, fetchedAt: new Date().toISOString(),
  })
}
