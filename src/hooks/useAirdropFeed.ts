import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface AirdropFeedRow {
  wallet: string
  amount: number
  mint: string
  createdAt: string
  txSignature: string
}

export interface AirdropStats {
  sentTodayAnsem: number
  sentTodaySol: number
  eventsToday: number
  recipients: number
  sent7dAnsem: number
  sent7dSol: number
  recipients7d: number
}

export const AIRDROPS_PAGE_SIZE = 20
const IDLE_STATS: AirdropStats = {
  sentTodayAnsem: 0,
  sentTodaySol: 0,
  eventsToday: 0,
  recipients: 0,
  sent7dAnsem: 0,
  sent7dSol: 0,
  recipients7d: 0,
}

function toRow(e: { wallet: string; amount: number; mint: string; created_at: string; tx_signature: string }): AirdropFeedRow {
  return { wallet: e.wallet, amount: Number(e.amount), mint: e.mint, createdAt: e.created_at, txSignature: e.tx_signature }
}

export function useAirdropFeed(page: number, mintFilter: string | null) {
  const [rows, setRows] = useState<AirdropFeedRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<AirdropStats>(IDLE_STATS)

  useEffect(() => {
    let cancelled = false

    async function refreshStats() {
      const [today, sevenDay] = await Promise.all([
        supabase.from('airdrop_stats_today').select('sent_today_ansem, sent_today_sol, events_today, recipients').maybeSingle(),
        supabase.from('airdrop_stats_7d').select('sent_7d_ansem, sent_7d_sol, recipients_7d').maybeSingle(),
      ])
      if (cancelled) return
      setStats((prev) => ({
        sentTodayAnsem: today.data ? Number(today.data.sent_today_ansem) : prev.sentTodayAnsem,
        sentTodaySol: today.data ? Number(today.data.sent_today_sol) : prev.sentTodaySol,
        eventsToday: today.data ? Number(today.data.events_today) : prev.eventsToday,
        recipients: today.data ? Number(today.data.recipients) : prev.recipients,
        sent7dAnsem: sevenDay.data ? Number(sevenDay.data.sent_7d_ansem) : prev.sent7dAnsem,
        sent7dSol: sevenDay.data ? Number(sevenDay.data.sent_7d_sol) : prev.sent7dSol,
        recipients7d: sevenDay.data ? Number(sevenDay.data.recipients_7d) : prev.recipients7d,
      }))
    }

    async function load() {
      const from = page * AIRDROPS_PAGE_SIZE
      const to = from + AIRDROPS_PAGE_SIZE - 1
      let query = supabase
        .from('airdrop_events')
        .select('wallet, amount, mint, created_at, tx_signature', { count: 'exact' })
        .order('created_at', { ascending: false })
      if (mintFilter) query = query.eq('mint', mintFilter)
      const { data, count } = await query.range(from, to)

      if (cancelled) return
      if (data) setRows(data.map(toRow))
      if (typeof count === 'number') setTotalCount(count)
      await refreshStats()
    }

    load()

    // New airdrops only splice into the visible list on page 1 (the most
    // recent page) — other pages are a stable historical view and shouldn't
    // shift under someone mid-read. The total count still updates everywhere
    // so pagination stays accurate. Rows that don't match the active mint
    // filter are ignored entirely, same as if they'd never come in.
    const channel = supabase
      .channel('airdrop-events-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'airdrop_events' }, (payload) => {
        const e = payload.new as { wallet: string; amount: number; mint: string; created_at: string; tx_signature: string }
        if (mintFilter && e.mint !== mintFilter) return
        setTotalCount((prev) => prev + 1)
        if (page !== 0) return
        setRows((prev) => [toRow(e), ...prev].slice(0, AIRDROPS_PAGE_SIZE))
        refreshStats()
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [page, mintFilter])

  return { rows, stats, totalCount }
}
