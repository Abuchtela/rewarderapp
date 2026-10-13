'use client'
import { useState, useEffect } from 'react'
export interface ScoresResult {
  neynar: { fid: number; username: string; displayName: string; neynarScore: number | null; walletAddress: string | null } | null
  talent: { builderScore: number } | null
  status: { neynar: string; talent: string }
  fetchedAt: string
}
export function useScores({ fid, address }: { fid?: string; address?: string }) {
  const [data, setData] = useState<ScoresResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const abort = new AbortController()
    setData(null); setError(null)
    if (!fid && !address) return
    setLoading(true)
    const params = new URLSearchParams()
    if (fid) params.set('fid', fid)
    if (address) params.set('address', address)
    fetch(`/api/scores?${params}`, { signal: abort.signal }).then(async res => {
      if (!res.ok) throw new Error('Unable to load scores')
      setData(await res.json())
    }).catch(err => { if (!abort.signal.aborted) setError(err.message) })
      .finally(() => { if (!abort.signal.aborted) setLoading(false) })
    return () => abort.abort()
  }, [fid, address])
  return { data, loading, error }
}
