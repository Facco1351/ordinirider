import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const anno = searchParams.get('anno')
  const mese = searchParams.get('mese')

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('giornate')
    .select('*')
    .eq('id_rider', session.id)
    .order('datag', { ascending: true })

  if (anno && mese) {
    const from = `${anno}-${String(mese).padStart(2,'0')}-01`
    const to   = `${anno}-${String(mese).padStart(2,'0')}-31`
    query = query.gte('datag', from).lte('datag', to)
  } else if (anno) {
    query = query.gte('datag', `${anno}-01-01`).lte('datag', `${anno}-12-31`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  try {
    const body = await req.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase.from('giornate').insert({
      id_rider:          session.id,
      datag:             body.datag,
      giorno:            body.giorno,
      numero_ordini:     Number(body.numero_ordini)    || 0,
      ordini_consegnati: Number(body.ordini_consegnati)|| 0,
      incentivi:         Number(body.incentivi)        || 0,
      mance:             Number(body.mance)            || 0,
      contanti:          Number(body.contanti)         || 0,
      benzina:           Number(body.benzina)          || 0,
      km:                Number(body.km)               || 0,
      luogo:             body.luogo || '',
    }).select().single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('POST giornate', e)
    return NextResponse.json({ error: 'Errore salvataggio' }, { status: 500 })
  }
}
