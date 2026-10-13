// Notifications are not enabled until verified events and durable storage exist.
export async function POST() {
  return Response.json({ error: 'Notifications are not configured' }, { status: 503 })
}
