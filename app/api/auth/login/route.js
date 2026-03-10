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
    const { data: rider } = await supabase
      .from('riders')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (!rider) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, rider.password_hash)
    if (!ok) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 })
    }

    const token = await createSession(rider)

    const res = NextResponse.json({ ok: true, nome: rider.nome })
    res.cookies.set(SESSION_COOKIE.name, token, SESSION_COOKIE)
    return res
  } catch (e) {
    console.error('login error', e)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
