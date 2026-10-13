// app/.well-known/farcaster.json/route.ts
// This endpoint proves ownership of your mini app to Farcaster.
// Run `npm run manifest` to generate the FARCASTER_* env values.

const APP_URL = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

function withValidProperties(
  properties: Record<string, undefined | string | string[]>
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    )
  )
}

export async function GET() {
  const envAssociation = {
    header: process.env.FARCASTER_HEADER,
    payload: process.env.FARCASTER_PAYLOAD,
    signature: process.env.FARCASTER_SIGNATURE,
  }
  if (!envAssociation.header || !envAssociation.payload || !envAssociation.signature) return Response.json({ error: 'A newly signed Farcaster association is required' }, { status: 503 })
  const association = envAssociation
  try {
    const payload = JSON.parse(Buffer.from(association.payload ?? '', 'base64url').toString())
    if (!process.env.NEXT_PUBLIC_URL || new URL(APP_URL).protocol !== 'https:' || payload.domain !== new URL(APP_URL).hostname) {
      return Response.json({ error: 'A Farcaster association for this HTTPS domain is required' }, { status: 503 })
    }
  } catch { return Response.json({ error: 'Invalid Farcaster association' }, { status: 503 }) }
  return Response.json({
    accountAssociation: association,
    frame: withValidProperties({
      version: '1',
      name: 'Paycheck',
      subtitle: 'Get paid to build on Base',
      description:
        'Track verified builder scores and send onchain tips. Built by @abuchtela.',
      screenshotUrls: [],
      iconUrl: `${APP_URL}/icon.png`,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: '#0A0A0F',
      homeUrl: APP_URL,
      webhookUrl: `${APP_URL}/api/webhook`,
      primaryCategory: 'finance',
      tags: ['builder', 'base', 'farcaster', 'earn', 'score'],
      heroImageUrl: `${APP_URL}/hero.png`,
      tagline: 'Your builder paycheck, onchain.',
      ogTitle: 'Paycheck — Get Paid to Build',
      ogDescription:
        'Track verified builder scores and onchain tips on Base.',
      ogImageUrl: `${APP_URL}/og.png`,
    }),
  })
}
