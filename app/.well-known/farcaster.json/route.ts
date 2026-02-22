// app/.well-known/farcaster.json/route.ts
// This endpoint proves ownership of your mini app to Farcaster.
// Run `npm run manifest` to generate the FARCASTER_* env values.

const URL = process.env.NEXT_PUBLIC_URL ?? 'https://paycheck.vercel.app'

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
  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: '1',
      name: 'Paycheck',
      subtitle: 'Get paid to build on Base',
      description:
        'Track your Neynar score, Builder Score, earn ETH for shipping. Built by @abuchtela.',
      screenshotUrls: [],
      iconUrl: `${URL}/icon.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: '#0A0A0F',
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: 'finance',
      tags: ['builder', 'base', 'farcaster', 'earn', 'score'],
      heroImageUrl: `${URL}/hero.png`,
      tagline: 'Your builder paycheck, onchain.',
      ogTitle: 'Paycheck — Get Paid to Build',
      ogDescription:
        'Track your Builder Score and earn ETH for shipping on Base.',
      ogImageUrl: `${URL}/og.png`,
    }),
  })
}
