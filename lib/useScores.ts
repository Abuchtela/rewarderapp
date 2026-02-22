'use client'

import { useState, useEffect, useCallback } from 'react'

interface NeynarData {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  followerCount: number
  followingCount: number
  neynarScore: number | null
  powerBadge: boolean
}

interface TalentData {
  builderScore: number
  activityScore: number
  identityScore: number
  skillsScore: number
  humanCheckmark: boolean
  passportId: number
  walletAddress: string
}

interface ScoresResult {
  neynar: NeynarData | null
  talent: TalentData | null
  fetchedAt: string
}

interface UseScoresOptions {
  fid?: string
  address?: string
}

export function useScores({ fid, address }: UseScoresOptions) {
  const [data, setData] = useState<ScoresResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchScores = useCallback(async () => {
    if (!fid && !address) return
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (fid) params.set('fid', fid)
      if (address) params.set('address', address)

      const res = await fetch(`/api/scores?${params}`)
      if (!res.ok) throw new Error('Failed to fetch scores')

      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [fid, address])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  return { data, loading, error, refetch: fetchScores }
}
