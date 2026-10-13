import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
const port = 3012
const url = `http://127.0.0.1:${port}`
const log = fs.openSync('/tmp/paycheck-test-server.log', 'w')
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], { stdio: ['ignore', log, log], env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } })
after(() => { server.kill('SIGTERM'); fs.closeSync(log) })
async function ready() {
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(url)).ok) return } catch {}
    if (server.exitCode !== null) throw new Error('Server exited: ' + fs.readFileSync('/tmp/paycheck-test-server.log', 'utf8'))
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error('Server did not start')
}
await ready()
test('production home renders with no hardcoded scores or earnings', async () => {
  const res = await fetch(url); assert.equal(res.status, 200)
  const html = await res.text(); assert.match(html, /Paycheck|Pay<!-- -->/)
  for (const fake of ['0.089', '0.31 ETH', '~2+ ETH', '0.72', '#412', '5 ETH tier']) assert.equal(html.includes(fake), false, fake)
})
test('missing score input and malformed inputs are rejected', async () => {
  for (const query of ['', '?fid=abc', '?address=0x0000000000000000000000000000000000000000', '?address=bad']) assert.equal((await fetch(`${url}/api/scores${query}`)).status, 400)
})
test('unconfigured contract cannot authorize a payment', async () => {
  const res = await fetch(`${url}/api/contract`); const data = await res.json()
  assert.equal(data.ready, false); assert.equal(data.status, 'not_configured')
})
test('an EOA is rejected as a Paycheck contract using live Base RPC', async () => {
  const res = await fetch(`${url}/api/contract?contract=0xDA4763E5aECcb3E97AdEc3FB14021510c524145A`)
  const data = await res.json(); assert.equal(data.ready, false); assert.equal(data.status, 'not_a_contract')
})
test('live Neynar lookup identifies the correct builder and does not invent a Talent score', async () => {
  const res = await fetch(`${url}/api/scores?fid=824669&address=0x748f6614ea6289664bc8beb84835e2f24fe52482`)
  const data = await res.json(); assert.equal(data.status.neynar, 'live')
  assert.equal(data.neynar.username, 'abuchtela'); assert.equal(data.neynar.fid, 824669)
  assert.equal(typeof data.neynar.neynarScore, 'number')
  assert.equal(data.talent, null); assert.equal(data.status.talent, 'not_configured')
})
test('unsigned Farcaster association and notifications cannot report success', async () => {
  assert.equal((await fetch(`${url}/.well-known/farcaster.json`)).status, 503)
  assert.equal((await fetch(`${url}/api/webhook`, { method: 'POST' })).status, 503)
})
