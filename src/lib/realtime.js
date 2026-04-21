import { supabase } from './supabase.js'

/**
 * Subscribe to Postgres changes on `documents`, `stages` and `audit_log`
 * and deliver per-table payloads to the provided handlers.
 *
 * Responsibilities beyond a bare `supabase.channel(...).subscribe()`:
 *
 *   • Exponential-backoff reconnect when the channel errors / times out,
 *     so a flaky network doesn't silently stop updates forever.
 *   • Re-apply the freshest access token to the realtime socket every
 *     time Supabase refreshes it (`TOKEN_REFRESHED`). Without this the
 *     socket keeps the original JWT and the connection drops at expiry.
 *   • Tear the channel down on `SIGNED_OUT` so a logged-out tab can't
 *     keep receiving data.
 *
 * Handlers are optional — pass only the ones you need. Each handler
 * receives the raw Supabase `RealtimePostgresChangesPayload`
 * (`{ eventType, new, old, schema, table, ... }`).
 *
 * Returns an `unsubscribe()` function that stops reconnect attempts,
 * tears down the channel and unhooks the auth listener.
 */
export function subscribeRealtime({ onDocChange, onStageChange, onAuditChange } = {}) {
  let channel = null
  let closed = false
  let backoff = 1000
  let reconnectTimer = null

  function connect() {
    if (closed) return

    channel = supabase
      .channel('ntc-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        (payload) => {
          try { onDocChange?.(payload) } catch (e) { console.error('[realtime] doc handler', e) }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stages' },
        (payload) => {
          try { onStageChange?.(payload) } catch (e) { console.error('[realtime] stage handler', e) }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'audit_log' },
        (payload) => {
          try { onAuditChange?.(payload) } catch (e) { console.error('[realtime] audit handler', e) }
        },
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          backoff = 1000
        } else if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT' ||
          status === 'CLOSED'
        ) {
          if (err) console.warn('[realtime] channel status', status, err)
          scheduleReconnect()
        }
      })
  }

  function scheduleReconnect() {
    if (closed || reconnectTimer) return
    const delay = backoff
    backoff = Math.min(backoff * 2, 30000)
    reconnectTimer = setTimeout(async () => {
      reconnectTimer = null
      try { if (channel) await supabase.removeChannel(channel) } catch {}
      channel = null
      connect()
    }, delay)
  }

  // Keep the realtime socket's auth in sync with the Supabase auth session.
  // Without re-setting on TOKEN_REFRESHED, the socket keeps the stale JWT
  // and RLS starts rejecting payloads once the old token expires.
  const { data: authSub } = supabase.auth.onAuthStateChange(async (evt, session) => {
    if (evt === 'TOKEN_REFRESHED' || evt === 'SIGNED_IN') {
      const token = session?.access_token
      if (!token) return
      try {
        // setAuth is both sync (stores token) and async (re-auths socket).
        // Swallow errors — worst case the reconnect loop picks it up.
        supabase.realtime.setAuth(token)
      } catch (e) {
        console.warn('[realtime] setAuth failed', e)
      }
    } else if (evt === 'SIGNED_OUT') {
      try { if (channel) await supabase.removeChannel(channel) } catch {}
      channel = null
    }
  })

  connect()

  return function unsubscribe() {
    closed = true
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    try { authSub?.subscription?.unsubscribe() } catch {}
    try { if (channel) supabase.removeChannel(channel) } catch {}
    channel = null
  }
}
