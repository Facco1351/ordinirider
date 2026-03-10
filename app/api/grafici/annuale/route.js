import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('guadagni')
    .select('anno, fatturato, bonifico, ordini')
    .eq('id_rider', session.id)
    .order('anno')

  // Aggrega per anno
  const anni = {}
  for (const r of data || []) {
    if (!anni[r.anno]) anni[r.anno] = { anno: r.anno, fatturato: 0, bonifico: 0, ordini: 0 }
    anni[r.anno].fatturato += Number(r.fatturato)
    anni[r.anno].bonifico  += Number(r.bonifico)
    anni[r.anno].ordini    += Number(r.ordini)
  }

  return NextResponse.json(Object.values(anni))
}
