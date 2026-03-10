import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('giornate')
    .select('*')
    .eq('id', params.id)
    .eq('id_rider', session.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Non trovata' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  try {
    const body = await req.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('giornate')
      .update({
        numero_ordini:     Number(body.numero_ordini)    || 0,
        ordini_consegnati: Number(body.ordini_consegnati)|| 0,
        incentivi:         Number(body.incentivi)        || 0,
        mance:             Number(body.mance)            || 0,
        contanti:          Number(body.contanti)         || 0,
        benzina:           Number(body.benzina)          || 0,
        km:                Number(body.km)               || 0,
        luogo:             body.luogo || '',
      })
      .eq('id', params.id)
      .eq('id_rider', session.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Errore aggiornamento' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('giornate')
    .delete()
    .eq('id', params.id)
    .eq('id_rider', session.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
