'use client'
import { useEffect, useState } from 'react'
import { useMiniKit, useAddFrame } from '@coinbase/onchainkit/minikit'
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet'
import { useAccount, useWriteContract, useDeployContract, usePublicClient, useSwitchChain } from 'wagmi'
import { base } from 'viem/chains'
import { parseEther } from 'viem'
import { useScores } from '@/lib/useScores'
import { PAYCHECK_ABI } from '@/lib/contract'
import { PAYCHECK_BYTECODE } from '@/lib/deployment'
import { CONTRACT_ADDRESS, DEFAULT_FID, PROFILE_ADDRESS, OWNER_ADDRESS, validAddress } from '@/lib/settings'

type Tab = 'scores' | 'tasks' | 'tip' | 'stats'
interface ContractState {
  ready: boolean; status: string; address?: `0x${string}`; owner?: string
  feeBps?: number; totalVolume?: string; totalFees?: string; pendingFees?: string; blockNumber?: string
}
const tasks = ['Connect GitHub and your wallet to Talent', 'Review your Farcaster profile and verified wallets', 'Deploy and verify the Paycheck contract', 'Gather transaction links and usage evidence for funding applications']
const styles = {
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 12 },
  input: { width: '100%', border: '1px solid var(--border2)', borderRadius: 8, padding: 10, margin: '8px 0 14px', background: 'var(--bg2)', color: 'var(--text)' },
  button: { border: '1px solid var(--border2)', borderRadius: 10, padding: '12px 14px', background: 'var(--green)', color: '#000', cursor: 'pointer', fontWeight: 700, margin: '4px 0' },
}
export default function PaycheckApp() {
  const { setFrameReady, isFrameReady, context } = useMiniKit()
  const addFrame = useAddFrame()
  const { address, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const { deployContractAsync } = useDeployContract()
  const client = usePublicClient({ chainId: base.id })
  const [tab, setTab] = useState<Tab>('scores')
  const [fid, setFid] = useState(DEFAULT_FID)
  const [profile, setProfile] = useState<string>(PROFILE_ADDRESS ?? '')
  const [contractAddress, setContractAddress] = useState<string>(CONTRACT_ADDRESS ?? '')
  const [contract, setContract] = useState<ContractState | null>(null)
  const [recipient, setRecipient] = useState<string>(OWNER_ADDRESS ?? '')
  const [amount, setAmount] = useState('0.001')
  const [completed, setCompleted] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [hash, setHash] = useState<string>('')
  const [pending, setPending] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [taskLoaded, setTaskLoaded] = useState(false)
  const taskKey = `paycheck-tasks:${fid}:${profile.toLowerCase()}`
  const { data, loading, error } = useScores({ fid: fid || undefined, address: validAddress(profile) ?? undefined })
  useEffect(() => { if (!isFrameReady) setFrameReady() }, [isFrameReady, setFrameReady])
  useEffect(() => { if (context?.user?.fid) setFid(String(context.user.fid)) }, [context?.user?.fid])
  useEffect(() => {
    if (!CONTRACT_ADDRESS) setContractAddress(localStorage.getItem('paycheck-deployed-contract') ?? '')
  }, [])
  useEffect(() => {
    setTaskLoaded(false)
    try { const value = JSON.parse(localStorage.getItem(taskKey) ?? '[]'); setCompleted(Array.isArray(value) ? value.filter(v => tasks.includes(v)) : []) } catch { setCompleted([]) }
    setTaskLoaded(true)
  }, [taskKey])
  useEffect(() => { if (taskLoaded) localStorage.setItem(taskKey, JSON.stringify(completed)) }, [completed, taskLoaded, taskKey])
  useEffect(() => {
    const abort = new AbortController(); setContract(null)
    const query = contractAddress ? `?contract=${encodeURIComponent(contractAddress)}` : ''
    fetch(`/api/contract${query}`, { signal: abort.signal }).then(res => res.json()).then(setContract)
      .catch(() => { if (!abort.signal.aborted) setContract({ ready: false, status: 'unavailable' }) })
    return () => abort.abort()
  }, [contractAddress, refresh])
  async function transact(deploy = false) {
    setMessage(''); setHash('')
    if (!address || !client) { setMessage('Connect your wallet first.'); return }
    if (deploy && OWNER_ADDRESS && address.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) { setMessage('Connect the configured protocol owner wallet.'); return }
    setPending(true)
    try {
      if (chainId !== base.id) await switchChainAsync({ chainId: base.id })
      let tx: `0x${string}`
      if (deploy) {
        tx = await deployContractAsync({ abi: PAYCHECK_ABI, bytecode: PAYCHECK_BYTECODE, args: [address, 150n], chainId: base.id, account: address })
      } else {
        const builder = validAddress(recipient)
        if (!contract?.ready || !contract.address || !builder) throw new Error('Verify the Paycheck contract and recipient address first.')
        const value = parseEther(amount)
        if (value <= 0n) throw new Error('Enter an ETH amount greater than zero.')
        const { request } = await client.simulateContract({ address: contract.address, abi: PAYCHECK_ABI, functionName: 'tip', args: [builder], value, account: address, chain: base })
        tx = await writeContractAsync(request)
      }
      setHash(tx); setMessage('Transaction submitted. Waiting for confirmation on Base…')
      const receipt = await client.waitForTransactionReceipt({ hash: tx, confirmations: 2 })
      if (receipt.status !== 'success') throw new Error('Transaction reverted on Base.')
      if (deploy && receipt.contractAddress) {
        setContractAddress(receipt.contractAddress)
        localStorage.setItem('paycheck-deployed-contract', receipt.contractAddress)
        setRecipient(address)
      }
      setRefresh(v => v + 1)
      setMessage(deploy ? 'Paycheck deployed and confirmed on Base.' : 'Tip confirmed on Base.')
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Transaction failed.') }
    finally { setPending(false) }
  }
  const neynar = data?.neynar?.neynarScore
  const builder = data?.talent?.builderScore
  return <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 16px 60px' }}>
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <div><h1 style={{ fontSize: 27 }}>💸 Pay<span style={{ color: 'var(--green)' }}>check</span></h1><p style={{ fontSize: 12, color: 'var(--text2)' }}>Builder reputation and onchain tips</p></div>
      <Wallet><ConnectWallet /><WalletDropdown><WalletDropdownDisconnect /></WalletDropdown></Wallet>
    </header>
    <nav style={{ display: 'flex', gap: 8, marginBottom: 18 }}>{(['scores', 'tasks', 'tip', 'stats'] as Tab[]).map(t => <button key={t} onClick={() => setTab(t)} style={{ ...styles.button, flex: 1, background: tab === t ? 'var(--green)' : 'var(--card)', color: tab === t ? '#000' : 'var(--text)' }}>{t[0].toUpperCase() + t.slice(1)}</button>)}</nav>
    {tab === 'scores' && <>
      <section style={styles.card}><h2 style={{ fontSize: 18, marginBottom: 12 }}>{data?.neynar ? `@${data.neynar.username}` : 'Builder profile'}</h2>
        <label htmlFor="fid">Farcaster FID</label><input id="fid" value={fid} onChange={e => setFid(e.target.value)} inputMode="numeric" style={styles.input} />
        <label htmlFor="profile">Wallet for Builder Score</label><input id="profile" value={profile} onChange={e => setProfile(e.target.value)} style={styles.input} />
        {address && <button style={styles.button} onClick={() => setProfile(address)}>Use connected wallet</button>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div><p>Neynar Score</p><strong style={{ fontSize: 30, color: 'var(--green)' }}>{loading ? '…' : neynar == null ? 'Unavailable' : neynar.toFixed(2)}</strong><p style={{ fontSize: 12 }}>{data?.status.neynar ?? error ?? 'Not loaded'}</p></div>
          <div><p>Builder Score</p><strong style={{ fontSize: 30, color: 'var(--blue)' }}>{loading ? '…' : builder ?? 'Unavailable'}</strong><p style={{ fontSize: 12 }}>{data?.status.talent ?? error ?? 'Not loaded'}</p></div>
        </div>{data && <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 14 }}>Fetched {new Date(data.fetchedAt).toLocaleString()}</p>}
      </section><section style={styles.card}><p>Scores do not guarantee funding. Paycheck does not claim or distribute builder rewards.</p><p style={{ marginTop: 12 }}><a href="https://talent.app" target="_blank" rel="noreferrer">Open Talent ↗</a></p><button style={styles.button} onClick={() => addFrame().catch(() => setMessage('Saving requires a supported Farcaster host.'))}>Save mini app</button></section>
    </>}
    {tab === 'tasks' && <section style={styles.card}><h2 style={{ marginBottom: 8 }}>Your checklist</h2><p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>Self-reported, saved in this browser. No score increases or completion are assumed.</p>{tasks.map(task => <label key={task} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}><input type="checkbox" checked={completed.includes(task)} onChange={() => setCompleted(prev => prev.includes(task) ? prev.filter(v => v !== task) : [...prev, task])} />{task}</label>)}</section>}
    {tab === 'tip' && <section style={styles.card}><h2 style={{ marginBottom: 14 }}>Send a tip on Base</h2>
      <label htmlFor="recipient">Builder receiving the tip</label><input id="recipient" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="0x…" style={styles.input} />
      <label htmlFor="amount">Amount in ETH</label><input id="amount" value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" style={styles.input} />
      <p style={{ marginBottom: 12 }}>Protocol fee: {contract?.ready ? `${(contract.feeBps ?? 0) / 100}%` : 'Unavailable until contract verification'}</p>
      <button style={styles.button} disabled={pending || !contract?.ready || !address || !validAddress(recipient)} onClick={() => transact()}>{pending ? 'Waiting…' : 'Review tip in wallet'}</button>
      {!contract?.ready && <p style={{ marginTop: 10 }}>Configure or deploy Paycheck in the Stats tab before sending.</p>}
    </section>}
    {tab === 'stats' && <section style={styles.card}><h2 style={{ marginBottom: 14 }}>Verified contract data</h2>
      <label htmlFor="contract">Paycheck contract on Base</label><input id="contract" value={contractAddress} onChange={e => setContractAddress(e.target.value)} placeholder="0x…" style={styles.input} />
      <p>Status: {contract?.status ?? 'Checking…'}</p>
      {contract?.ready && <><p style={{ marginTop: 10, overflowWrap: 'anywhere' }}>Owner: {contract.owner}</p><p>Total tips routed: {contract.totalVolume} ETH</p><p>Protocol fees recorded: {contract.totalFees} ETH</p><p>Pending fees: {contract.pendingFees} ETH</p><p>Read at Base block {contract.blockNumber}</p><a href={`https://basescan.org/address/${contract.address}`} target="_blank" rel="noreferrer">View contract ↗</a></>}
      <button style={styles.button} onClick={() => setRefresh(v => v + 1)}>Refresh chain data</button>
      {!contract?.ready && <div style={{ marginTop: 20 }}><h3>Deploy Paycheck</h3><p style={{ fontSize: 12, margin: '10px 0', color: 'var(--text2)' }}>Uses the connected wallet as protocol owner with a 1.5% fee. Base ETH is required for gas. Review the deployment in your wallet.</p><button style={styles.button} disabled={pending || !address} onClick={() => transact(true)}>Review deployment in wallet</button></div>}
    </section>}
    {message && <p role="status" style={{ ...styles.card, overflowWrap: 'anywhere' }}>{message}</p>}
    {hash && <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noreferrer">View transaction ↗</a>}
  </main>
}
