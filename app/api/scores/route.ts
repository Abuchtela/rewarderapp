// app/api/scores/route.ts
// Returns Neynar user score + Talent Protocol Builder Score for a given FID or address.
// Called by the frontend to show live scores.

import { NextRequest } from 'next/server'

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY ?? ''
const TALENT_API_KEY = process.env.TALENT_PROTOCOL_API_KEY ?? ''

// ── Neynar: get user by FID ──────────────────────────────────────────────────
async function getNeynarScore(fid: string) {
  try {
    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          accept: 'application/json',
          api_key: NEYNAR_API_KEY,
        },
        next: { revalidate: 3600 }, // cache 1 hour — scores update weekly
      }
    )
    if (!res.ok) return null

    const data = await res.json()
    const user = data?.users?.[0]
    if (!user) return null

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      neynarScore: user.experimental?.neynar_user_score ?? null,
      powerBadge: user.power_badge ?? false,
      verifications: user.verifications ?? [],
    }
  } catch {
    return null
  }
}

// ── Talent Protocol: get Builder Score by wallet address ─────────────────────
async function getBuilderScore(address: string) {
  try {
    const res = await fetch(
      `https://api.talentprotocol.com/api/v2/passports/${address}`,
      {
        headers: {
          'X-API-KEY': TALENT_API_KEY,
        },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return null

    const data = await res.json()
    const passport = data?.passport
    if (!passport) return null

    return {
      builderScore: passport.score ?? 0,
      activityScore: passport.activity_score ?? 0,
      identityScore: passport.identity_score ?? 0,
      skillsScore: passport.skills_score ?? 0,
      humanCheckmark: passport.human_checkmark ?? false,
      passportId: passport.passport_id,
      walletAddress: passport.main_wallet,
    }
  } catch {
    return null
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fid = searchParams.get('fid')
  const address = searchParams.get('address')

  if (!fid && !address) {
    return Response.json({ error: 'Provide fid or address param' }, { status: 400 })
  }

  const [neynarData, talentData] = await Promise.all([
    fid ? getNeynarScore(fid) : Promise.resolve(null),
    address ? getBuilderScore(address) : Promise.resolve(null),
  ])

  return Response.json({
    neynar: neynarData,
    talent: talentData,
    fetchedAt: new Date().toISOString(),
  })
}
