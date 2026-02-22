// app/api/webhook/route.ts
// Handles Farcaster frame webhook events (add/remove frame, notifications)

import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event } = body

    switch (event) {
      case 'frame_added':
        // User added Paycheck to their mini apps list
        console.log('[Paycheck webhook] Frame added by FID:', body.fid)
        // TODO: store in Redis for push notifications
        break

      case 'frame_removed':
        console.log('[Paycheck webhook] Frame removed by FID:', body.fid)
        // TODO: remove from Redis
        break

      case 'notifications_enabled':
        console.log('[Paycheck webhook] Notifications enabled:', body.fid)
        break

      case 'notifications_disabled':
        console.log('[Paycheck webhook] Notifications disabled:', body.fid)
        break

      default:
        console.log('[Paycheck webhook] Unknown event:', event)
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[Paycheck webhook] Error:', err)
    return Response.json({ error: 'Webhook error' }, { status: 500 })
  }
}
