import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const anno = searchParams.get('anno')
  if (!anno) return NextResponse.json({ error: 'anno obbligatorio' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('guadagni')
    .select('mese, fatturato, bonifico, ordini')
    .eq('id_rider', session.id)
    .eq('anno', anno)
    .order('mese')

  // Riempie tutti i 12 mesi (0 per quelli senza dati)
  const result = Array.from({ length: 12 }, (_, i) => {
    const found = (data || []).find(d => d.mese === i + 1)
    return { fatturato: 0, bonifico: 0, ordini: 0, ...found }
  })

  return NextResponse.json(result)
}
