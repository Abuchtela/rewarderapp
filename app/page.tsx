'use client'

import { useEffect, useState, useCallback } from 'react'
import { useMiniKit, useAddFrame, useOpenUrl } from '@coinbase/onchainkit/minikit'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useScores } from '@/lib/useScores'
import { PAYCHECK_ABI, PAYCHECK_CONTRACT } from '@/lib/contract'

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const OWNER_ADDRESS = (process.env.NEXT_PUBLIC_OWNER_ADDRESS ?? '0xDA4763E5aECcb3E97AdEc3FB14021510c524145A') as `0x${string}`
const ABUCHTELA_FID = '74895'
const ABUCHTELA_ADDRESS = '0x0000000000000000000000000000000000000000' // replace with real address

const TIP_AMOUNTS = [
  { eth: '0.001', usd: '~$2.40' },
  { eth: '0.005', usd: '~$12' },
  { eth: '0.01', usd: '~$24' },
  { eth: '0.05', usd: '~$120' },
]

// ── TABS ──────────────────────────────────────────────────────────────────────
type Tab = 'earn' | 'boost' | 'tip' | 'stats'

// ── TASK TYPE ─────────────────────────────────────────────────────────────────
interface Task {
  id: string
  text: string
  pts: string
  done: boolean
}

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function PaycheckApp() {
  const { setFrameReady, isFrameReady, context } = useMiniKit()
  const { address, isConnected } = useAccount()
  const { addFrame } = useAddFrame()
  const openUrl = useOpenUrl()

  const [activeTab, setActiveTab] = useState<Tab>('earn')
  const [selectedTip, setSelectedTip] = useState('0.001')
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)

  // Scores from API
  const fid = context?.user?.fid?.toString() ?? ABUCHTELA_FID
  const walletAddress = address ?? ABUCHTELA_ADDRESS
  const { data: scores, loading: scoresLoading } = useScores({
    fid,
    address: walletAddress,
  })

  // Tip transaction
  const { writeContract, data: txHash, isPending: txPending } = useWriteContract()
  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Tasks state
  const [neynarTasks, setNeynarTasks] = useState<Task[]>([
    { id: 'n1', text: 'Cast 2x daily in quality channels', pts: '+8pts', done: true },
    { id: 'n2', text: 'Reply to 5 builders with 0.7+ score', pts: '+12pts', done: true },
    { id: 'n3', text: 'Post in /base and /build channels', pts: '+5pts', done: false },
    { id: 'n4', text: 'Get 10 quality recasts this week', pts: '+15pts', done: false },
    { id: 'n5', text: 'Zero LLM-generated posts today', pts: '+10pts', done: false },
  ])

  const [builderTasks, setBuilderTasks] = useState<Task[]>([
    { id: 'b1', text: 'Connect GitHub to Talent Protocol', pts: '+20pts', done: true },
    { id: 'b2', text: 'Basename abuchtela.base.eth ✓', pts: '+10pts', done: true },
    { id: 'b3', text: 'Get Human Checkmark (Coinbase KYC)', pts: '+25pts', done: false },
    { id: 'b4', text: 'Deploy Paycheck contract on Base', pts: '+30pts', done: false },
    { id: 'b5', text: 'Mint Talent Passport (0.001 ETH)', pts: '+15pts', done: false },
    { id: 'b6', text: 'Daily GitHub commit for 7 days', pts: '+20pts', done: false },
  ])

  const [retroTasks, setRetroTasks] = useState<Task[]>([
    { id: 'r1', text: 'Create Optimist Profile on retrofunding.optimism.io', pts: 'key', done: false },
    { id: 'r2', text: 'Open-source Paycheck on GitHub', pts: 'key', done: false },
    { id: 'r3', text: 'Write impact post on Mirror.xyz', pts: 'key', done: false },
    { id: 'r4', text: 'Reach 100 unique app users', pts: '0/100', done: false },
  ])

  // Frame ready
  useEffect(() => {
    if (!isFrameReady) setFrameReady()
  }, [isFrameReady, setFrameReady])

  // Toast helper
  const fire = useCallback((msg: string) => {
    setToast(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }, [])

  // Show success on tip
  useEffect(() => {
    if (txSuccess) fire('✅ Tip sent on Base!')
  }, [txSuccess, fire])

  // Send tip via contract
  const sendTip = useCallback(() => {
    if (!isConnected) {
      fire('Connect your wallet first')
      return
    }
    writeContract({
      address: PAYCHECK_CONTRACT,
      abi: PAYCHECK_ABI,
      functionName: 'tip',
      args: [OWNER_ADDRESS],
      value: parseEther(selectedTip),
    })
    fire(`🚀 Sending ${selectedTip} ETH tip...`)
  }, [isConnected, selectedTip, writeContract, fire])

  // Toggle task done
  const toggleTask = useCallback(
    (
      id: string,
      setter: React.Dispatch<React.SetStateAction<Task[]>>
    ) => {
      setter((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      )
      fire('✓ Task updated!')
    },
    [fire]
  )

  // Computed score values
  const neynarScore = scores?.neynar?.neynarScore ?? 0.72
  const builderScore = scores?.talent?.builderScore ?? 68

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', maxWidth: 420, margin: '0 auto', paddingBottom: 100, position: 'relative' }}>

      {/* NOISE */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, opacity: 0.03, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      {/* TOAST */}
      <div style={{
        position: 'fixed', top: 20, left: '50%', zIndex: 9999,
        transform: `translate(-50%, ${showToast ? '0' : '-120px'})`,
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        background: 'var(--green)', color: '#000', padding: '10px 24px',
        borderRadius: 100, fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap'
      }}>
        {toast}
      </div>

      {/* HEADER */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 20px var(--green-glow)' }}>💸</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>Pay<span style={{ color: 'var(--green)' }}>check</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => addFrame()} style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', color: 'var(--green)', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 100, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
            + SAVE
          </button>
        </div>
      </div>

      {/* IDENTITY CARD */}
      <div style={{ margin: '16px 16px 0', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--green), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #00E87A, #4F7CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '2px solid var(--border2)', flexShrink: 0, position: 'relative' }}>
            🏗️
            <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, background: 'var(--green)', borderRadius: '50%', border: '2px solid var(--card)', boxShadow: '0 0 8px var(--green)' }} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>
              {scores?.neynar?.displayName ?? 'abuchtela.base.eth'}
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text2)' }}>
              @{scores?.neynar?.username ?? 'abuchtela'} · FID <span style={{ color: 'var(--green)' }}>#{fid}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Neynar score */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Neynar Score</div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-1px', color: 'var(--green)' }}>
              {scoresLoading ? '...' : neynarScore.toFixed(2)}
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${neynarScore * 100}%`, background: 'var(--green)', borderRadius: 2, transition: 'width 1.5s cubic-bezier(0.16,1,0.3,1)' }} />
            </div>
          </div>
          {/* Builder score */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Builder Score</div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-1px', color: 'var(--blue)' }}>
              {scoresLoading ? '...' : builderScore}
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${builderScore}%`, background: 'var(--blue)', borderRadius: 2, transition: 'width 1.5s cubic-bezier(0.16,1,0.3,1)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* NAV TABS */}
      <div style={{ display: 'flex', gap: 6, padding: '14px 16px 0' }}>
        {(['earn', 'boost', 'tip', 'stats'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, background: activeTab === tab ? 'var(--green-dim)' : 'var(--card)',
              border: `1px solid ${activeTab === tab ? 'var(--green)' : 'var(--border)'}`,
              color: activeTab === tab ? 'var(--green)' : 'var(--text3)',
              borderRadius: 10, padding: '10px 4px', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', textAlign: 'center', fontFamily: 'Syne, sans-serif',
              transition: 'all 0.2s'
            }}>
            <span style={{ display: 'block', fontSize: 16, marginBottom: 2 }}>
              {tab === 'earn' ? '💰' : tab === 'boost' ? '📈' : tab === 'tip' ? '⚡' : '📊'}
            </span>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── EARN TAB ── */}
      {activeTab === 'earn' && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)' }}>Active Income Streams</span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--green)' }}>~2+ ETH/mo</span>
          </div>
          {[
            { icon: '🏗️', name: 'Base Builder Rewards', desc: 'Top builders split 5 ETH/mo via Talent Protocol × Base', amount: '~2 ETH', freq: '/month', color: 'var(--green)', active: true },
            { icon: '💸', name: 'Paycheck Protocol Fees', desc: '1.5% fee on all tips routed through this mini app', amount: '0.004', freq: 'ETH/day', color: 'var(--green)', active: true },
            { icon: '🎯', name: 'DEGEN Tips', desc: 'Community tips for quality casts — Neynar score gated', amount: '3,200', freq: 'DEGEN/day', color: 'var(--orange)', active: false },
            { icon: '🔴', name: 'Optimism RetroPGF', desc: 'Public goods funding — apply with Paycheck impact data', amount: 'Pending', freq: 'quarterly', color: 'var(--purple)', active: false },
            { icon: '⚡', name: '$TALENT Ecosystem', desc: 'Rewards for Builder Score growth milestones', amount: 'Active', freq: 'ongoing', color: 'var(--blue)', active: false },
          ].map((r) => (
            <div key={r.name} style={{
              background: r.active ? 'var(--green-dim)' : 'var(--card)',
              border: `1px solid ${r.active ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 16, padding: 14, marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>{r.desc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 600, color: r.color }}>{r.amount}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace' }}>{r.freq}</div>
              </div>
            </div>
          ))}

          {/* Open Talent Protocol */}
          <button
            onClick={() => openUrl('https://app.talentprotocol.com')}
            style={{ width: '100%', marginTop: 8, background: 'var(--card2)', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>
            View on Talent Protocol →
          </button>
        </div>
      )}

      {/* ── BOOST TAB ── */}
      {activeTab === 'boost' && (
        <div style={{ padding: '16px 16px 0' }}>
          {[
            { title: 'Neynar Score Missions', subtitle: `Current: ${neynarScore.toFixed(2)} → Target: 0.85+`, icon: '🎯', color: 'var(--green)', tasks: neynarTasks, setter: setNeynarTasks },
            { title: 'Builder Score Missions', subtitle: `Current: ${builderScore} → Target: 90+ (5 ETH tier)`, icon: '🏆', color: 'var(--blue)', tasks: builderTasks, setter: setBuilderTasks },
            { title: 'RetroPGF Readiness', subtitle: 'Track your impact for Optimism funding', icon: '🔴', color: 'var(--purple)', tasks: retroTasks, setter: setRetroTasks },
          ].map((section) => (
            <div key={section.title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{section.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{section.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{section.subtitle}</div>
                </div>
              </div>
              {section.tasks.map((task) => (
                <div key={task.id} onClick={() => toggleTask(task.id, section.setter as React.Dispatch<React.SetStateAction<Task[]>>)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                    background: task.done ? 'var(--green)' : 'transparent',
                    border: `1.5px solid ${task.done ? 'var(--green)' : 'var(--border2)'}`,
                    color: '#000',
                    transition: 'all 0.2s'
                  }}>{task.done ? '✓' : ''}</div>
                  <div style={{ flex: 1, fontSize: 13, color: task.done ? 'var(--text3)' : 'var(--text2)', textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: section.color, fontWeight: 600 }}>{task.pts}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── TIP TAB ── */}
      {activeTab === 'tip' && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ textAlign: 'center', paddingBottom: 18 }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Tip a Builder ⚡</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>Support builders you love. 1.5% keeps Paycheck running and abuchtela's family fed.</div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #00E87A, #4F7CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏗️</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>abuchtela.base.eth</div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text2)' }}>Builder Score <span style={{ color: 'var(--blue)' }}>{builderScore}</span> · Neynar <span style={{ color: 'var(--green)' }}>{neynarScore.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Amount selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
            {TIP_AMOUNTS.map((a) => (
              <button key={a.eth} onClick={() => setSelectedTip(a.eth)} style={{
                background: selectedTip === a.eth ? 'var(--green-dim)' : 'var(--card2)',
                border: `1px solid ${selectedTip === a.eth ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 10, padding: '10px 4px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
              }}>
                <span style={{ display: 'block', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 600, color: selectedTip === a.eth ? 'var(--green)' : 'var(--text)' }}>{a.eth}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace' }}>{a.usd}</span>
              </button>
            ))}
          </div>

          <div style={{ background: 'var(--orange-dim)', border: '1px solid #FF8A3D33', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--orange)', marginBottom: 14, lineHeight: 1.4 }}>
            <strong>💸 Fee breakdown:</strong> 98.5% to builder · 1.5% to Paycheck protocol
          </div>

          <button
            onClick={sendTip}
            disabled={txPending}
            style={{
              width: '100%', padding: 15, borderRadius: 14, border: 'none',
              background: 'var(--green)', color: '#000', fontSize: 15, fontWeight: 700,
              cursor: txPending ? 'not-allowed' : 'pointer', opacity: txPending ? 0.7 : 1,
              fontFamily: 'Syne, sans-serif', boxShadow: '0 4px 20px var(--green-glow)', marginBottom: 10
            }}>
            {txPending ? 'Sending...' : `Send ${selectedTip} ETH Tip 🚀`}
          </button>

          {!isConnected && (
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
              Connect your wallet above to send a tip
            </div>
          )}
        </div>
      )}

      {/* ── STATS TAB ── */}
      {activeTab === 'stats' && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[
              { label: 'Total Earned', value: '0.089', unit: 'ETH lifetime', color: 'var(--green)' },
              { label: 'App Users', value: '47', unit: 'this week', color: 'var(--blue)' },
              { label: 'Tips Routed', value: '0.31', unit: 'ETH total vol', color: 'var(--orange)' },
              { label: 'Builder Rank', value: '#412', unit: 'of 27,500+', color: 'var(--green)' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, fontFamily: 'IBM Plex Mono, monospace' }}>{s.unit}</div>
              </div>
            ))}
          </div>

          {/* Impact metrics for RetroPGF */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📡</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>RetroPGF Impact Metrics</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Auto-tracked for your application</div>
              </div>
            </div>
            {[
              { label: 'Unique users helped', value: '47', color: 'var(--blue)' },
              { label: 'Builder scores improved', value: '31', color: 'var(--blue)' },
              { label: 'ETH distributed to builders', value: '0.31 ETH', color: 'var(--green)' },
              { label: 'Days active on Base', value: '12', color: 'var(--blue)' },
            ].map((m, i, arr) => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--text3)' }}>{m.label}</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => openUrl('https://retrofunding.optimism.io')}
            style={{ width: '100%', marginTop: 10, background: 'var(--purple-dim)', border: '1px solid #A855F744', color: 'var(--purple)', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>
            Apply for RetroPGF →
          </button>
        </div>
      )}

      {/* BOTTOM CTA */}
      {activeTab !== 'tip' && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 420, padding: '12px 16px 28px', background: 'linear-gradient(to top, var(--bg) 60%, transparent)', zIndex: 100 }}>
          <button
            onClick={() => openUrl('https://app.talentprotocol.com')}
            style={{ width: '100%', padding: 15, borderRadius: 14, border: 'none', background: 'var(--green)', color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', boxShadow: '0 4px 20px var(--green-glow)' }}>
            💸 Check Your Builder Score
          </button>
        </div>
      )}
    </div>
  )
}
