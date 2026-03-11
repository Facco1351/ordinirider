import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req) {
  try {
    const { username, email, nome, cognome, password } = await req.json()

    if (!username || !email || !nome || !cognome || !password) {
      return NextResponse.json({ error: 'Tutti i campi sono obbligatori' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La password deve avere almeno 6 caratteri' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: existing } = await supabase
      .from('riders')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Username o email già registrati' }, { status: 409 })
    }

    // La colonna nel DB si chiama 'password' (non 'password_hash')
    const hashed = await bcrypt.hash(password, 12)

    const { error } = await supabase.from('riders').insert({
      username,
      email,
      nome,
      cognome,
      password: hashed,
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[register] errore:', e)
    return NextResponse.json({ error: e.message || 'Errore server' }, { status: 500 })
  }
}
