import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createSession, SESSION_COOKIE } from '@/lib/session'

export async function POST(req) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Inserisci username e password' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: rider, error: dbErr } = await supabase
      .from('riders')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (dbErr) {
      console.error('[login] db error:', dbErr)
      return NextResponse.json({ error: 'Errore database' }, { status: 500 })
    }

    if (!rider) {
      return NextResponse.json({ error: 'Username non trovato' }, { status: 401 })
    }

    // La colonna nel DB si chiama 'password'
    const ok = await bcrypt.compare(password, rider.password)
    if (!ok) {
      return NextResponse.json({ error: 'Password errata' }, { status: 401 })
    }

    const token = await createSession(rider)

    const res = NextResponse.json({ ok: true, nome: rider.nome })
    res.cookies.set(SESSION_COOKIE.name, token, SESSION_COOKIE)
    return res
  } catch (e) {
    console.error('[login] errore:', e)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
