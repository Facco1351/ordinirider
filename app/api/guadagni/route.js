import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { aggregaGiornate } from '@/lib/calcoli'

export async function GET(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const anno = searchParams.get('anno')

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('guadagni')
    .select('*')
    .eq('id_rider', session.id)
    .order('anno', { ascending: true })
    .order('mese', { ascending: true })

  if (anno) query = query.eq('anno', anno)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Crea/aggiorna il riepilogo mensile aggregando le giornate
export async function POST(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  try {
    const { anno, mese } = await req.json()
    if (!anno || !mese) return NextResponse.json({ error: 'anno e mese obbligatori' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    // Carica tutte le giornate del mese
    const from = `${anno}-${String(mese).padStart(2,'0')}-01`
    const to   = `${anno}-${String(mese).padStart(2,'0')}-31`
    const { data: giornate } = await supabase
      .from('giornate')
      .select('*')
      .eq('id_rider', session.id)
      .gte('datag', from)
      .lte('datag', to)

    const agg = aggregaGiornate(giornate || [])

    // Upsert (inserisce o aggiorna se esiste già)
    const { data, error } = await supabase
      .from('guadagni')
      .upsert({
        id_rider:  session.id,
        anno:      Number(anno),
        mese:      Number(mese),
        fatturato: agg.totale,
        ordini:    agg.ordini,
        bonifico:  agg.bonifico,
      }, { onConflict: 'id_rider,anno,mese' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('POST guadagni', e)
    return NextResponse.json({ error: 'Errore creazione mese' }, { status: 500 })
  }
}
