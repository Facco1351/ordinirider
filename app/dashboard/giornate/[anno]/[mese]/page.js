'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MESI, MESI_SHORT, calcolaGiornata, aggregaGiornate, fmt } from '@/lib/calcoli'

export default function VisualizzaGiornate({ params }) {
  const { anno, mese } = params
  const meseName = MESI[Number(mese) - 1]
  const router   = useRouter()

  const [giornate, setGiornate] = useState([])
  const [loading, setLoading]   = useState(true)
  const [creando, setCreando]   = useState(false)
  const [msg, setMsg]           = useState('')

  useEffect(() => {
    fetch(`/api/giornate?anno=${anno}&mese=${mese}`)
      .then(r => r.json())
      .then(d => { setGiornate(d); setLoading(false) })
  }, [anno, mese])

  const agg = aggregaGiornate(giornate)

  async function creaMese() {
    setCreando(true)
    const res = await fetch('/api/guadagni', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anno: Number(anno), mese: Number(mese) }),
    })
    setCreando(false)
    setMsg(res.ok ? 'Mese salvato nei guadagni! ✓' : 'Errore salvataggio')
  }

  return (
    <div style={{position:'relative',zIndex:1}}>
      {/* Header */}
      <div className="page-header">
        <Link href="/dashboard/giornate" className="btn-icon">←</Link>
        <h2>{meseName} {anno}</h2>
        <Link href="/dashboard/giornate/inserisci" className="btn btn-primary btn-sm">+ Giornata</Link>
      </div>

      <div className="page-content">
        {/* KPI */}
        <div className="kpi-grid kpi-grid-2a anim-up">
          <div className="kpi"><span className="kpi-icon">💰</span><div className="kpi-label">Fatturato</div><div className="kpi-value c-acc">{fmt(agg.totale)} €</div></div>
          <div className="kpi anim-d1"><span className="kpi-icon">🏦</span><div className="kpi-label">Bonifico</div><div className="kpi-value c-ora">{fmt(agg.bonifico)} €</div></div>
          <div className="kpi anim-d2"><span className="kpi-icon">🧾</span><div className="kpi-label">Tasse</div><div className="kpi-value c-red">{fmt(agg.tasse)} €</div></div>
          <div className="kpi anim-d3"><span className="kpi-icon">📦</span><div className="kpi-label">Ordini</div><div className="kpi-value">{agg.ordini}</div></div>
          <div className="kpi anim-d4"><span className="kpi-icon">🛣️</span><div className="kpi-label">Km</div><div className="kpi-value c-blu">{agg.km}</div></div>
          <div className="kpi anim-d5"><span className="kpi-icon">⛽</span><div className="kpi-label">Benzina</div><div className="kpi-value">{fmt(agg.benzina)} €</div></div>
        </div>

        {loading && <p style={{color:'var(--t2)',textAlign:'center',padding:'2rem'}}>Caricamento...</p>}

        {/* MOBILE: card list */}
        {!loading && (
          <>
            <div className="mob">
              <div className="section-label">Giornate</div>
              <div style={{display:'flex',flexDirection:'column',gap:'.6rem'}}>
                {giornate.map(g => {
                  const { totale } = calcolaGiornata(g)
                  const day = new Date(g.datag).getUTCDate()
                  return (
                    <Link key={g.id} href={`/dashboard/giornate/modifica/${g.id}`} className="g-card">
                      <div className="gc-head">
                        <div>
                          <div className="gc-date">{String(day).padStart(2,'0')} {meseName}</div>
                          <div className="gc-day">{g.giorno}</div>
                        </div>
                        <div>
                          <div className="gc-tot">{fmt(totale)} €</div>
                          <div className="gc-tot-sub">{g.numero_ordini} ordini</div>
                        </div>
                      </div>
                      <div className="gc-body">
                        <div className="gc-grid">
                          <div className="gc-item"><span className="gc-lbl">Consegnati</span><span className="gc-v c-grn">{fmt(g.ordini_consegnati)} €</span></div>
                          <div className="gc-item"><span className="gc-lbl">Incentivi</span><span className="gc-v c-ora">{fmt(g.incentivi)} €</span></div>
                          <div className="gc-item"><span className="gc-lbl">Mance</span><span className="gc-v c-pur">{fmt(g.mance)} €</span></div>
                          <div className="gc-item"><span className="gc-lbl">Contanti</span><span className="gc-v">{fmt(g.contanti)} €</span></div>
                          <div className="gc-item"><span className="gc-lbl">Benzina</span><span className="gc-v c-blu">{fmt(g.benzina)} €</span></div>
                          <div className="gc-item"><span className="gc-lbl">Km</span><span className="gc-v">{g.km}</span></div>
                        </div>
                        <div className="gc-foot">
                          <span>📍 {g.luogo}</span>
                          <span style={{color:'var(--t3)',fontSize:'.72rem'}}>modifica ›</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Riepilogo mobile */}
              <div className="totali-box">
                <div className="tot-row"><span className="lbl">Ordini</span><span className="v">{agg.ordini}</span></div>
                <div className="tot-row"><span className="lbl">Fatturato</span><span className="v c-acc">{fmt(agg.totale)} €</span></div>
                <div className="tot-row"><span className="lbl">Tasse (20%+2€)</span><span className="v c-red">{fmt(agg.tasse)} €</span></div>
                <div className="tot-row"><span className="lbl">Km totali</span><span className="v">{agg.km}</span></div>
                <div className="tot-row bon"><span className="lbl">Bonifico netto</span><span className="v">{fmt(agg.bonifico)} €</span></div>
              </div>
            </div>

            {/* DESKTOP: tabella */}
            <div className="dsk">
              <div className="section-label">Dettaglio giornate</div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr>
                    <th>Data</th><th>Giorno</th><th>Ordini</th>
                    <th>Consegnati €</th><th>Incentivi €</th><th>Mance €</th>
                    <th>Contanti €</th><th>Benzina €</th><th>Km</th><th>Luogo</th><th>Totale €</th>
                  </tr></thead>
                  <tbody>
                    {giornate.map(g => {
                      const { totale } = calcolaGiornata(g)
                      const day = new Date(g.datag).getUTCDate()
                      return (
                        <tr key={g.id} onClick={()=>router.push(`/dashboard/giornate/modifica/${g.id}`)}>
                          <td style={{fontFamily:'var(--fh)',fontWeight:700}}>{String(day).padStart(2,'0')}</td>
                          <td style={{color:'var(--t2)'}}>{g.giorno}</td>
                          <td>{g.numero_ordini}</td>
                          <td style={{color:'#a8f5b0'}}>{fmt(g.ordini_consegnati)}</td>
                          <td style={{color:'var(--acc2)'}}>{fmt(g.incentivi)}</td>
                          <td style={{color:'#c9b8ff'}}>{fmt(g.mance)}</td>
                          <td>{fmt(g.contanti)}</td>
                          <td style={{color:'#7ecfff'}}>{fmt(g.benzina)}</td>
                          <td>{g.km}</td>
                          <td><span style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:99,padding:'.18rem .6rem',fontSize:'.76rem'}}>📍 {g.luogo}</span></td>
                          <td style={{fontFamily:'var(--fh)',fontWeight:700,color:'var(--acc)'}}>{fmt(totale)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{background:'var(--bg3)',fontWeight:600,borderTop:'2px solid var(--border)'}}>
                      <td colSpan={2} style={{padding:'.82rem .8rem',borderLeft:'3px solid var(--t2)'}}>Totali</td>
                      <td style={{padding:'.82rem .8rem'}}>{agg.ordini}</td>
                      <td style={{padding:'.82rem .8rem',color:'#a8f5b0'}}>{fmt(agg.consegnati)}</td>
                      <td style={{padding:'.82rem .8rem',color:'var(--acc2)'}}>{fmt(agg.incentivi)}</td>
                      <td style={{padding:'.82rem .8rem',color:'#c9b8ff'}}>{fmt(agg.mance)}</td>
                      <td style={{padding:'.82rem .8rem'}}>{fmt(agg.contanti)}</td>
                      <td style={{padding:'.82rem .8rem',color:'#7ecfff'}}>{fmt(agg.benzina)}</td>
                      <td style={{padding:'.82rem .8rem'}}>{agg.km}</td>
                      <td style={{padding:'.82rem .8rem'}}>—</td>
                      <td style={{padding:'.82rem .8rem',fontFamily:'var(--fh)',color:'var(--acc)'}}>{fmt(agg.totale)}</td>
                    </tr>
                    <tr style={{background:'rgba(255,69,32,.05)'}}>
                      <td colSpan={2} style={{padding:'.82rem .8rem',borderLeft:'3px solid #ff7f5c',color:'#ff7f5c',fontFamily:'var(--fh)',fontWeight:700}}>Tasse 20%+2€</td>
                      <td style={{padding:'.82rem .8rem'}}>—</td>
                      <td style={{padding:'.82rem .8rem',color:'#ff7f5c'}}>{fmt(agg.consegnati*.2)}</td>
                      <td style={{padding:'.82rem .8rem',color:'#ff7f5c'}}>{fmt(agg.incentivi*.2)}</td>
                      <td style={{padding:'.82rem .8rem',color:'#ff7f5c'}}>{fmt(agg.mance*.2)}</td>
                      <td colSpan={4} style={{padding:'.82rem .8rem'}}>—</td>
                      <td style={{padding:'.82rem .8rem',color:'#ff7f5c',fontWeight:700}}>{fmt(agg.tasse)}</td>
                    </tr>
                    <tr style={{background:'rgba(255,140,58,.06)'}}>
                      <td colSpan={2} style={{padding:'.82rem .8rem',borderLeft:'3px solid var(--acc2)',color:'var(--acc2)',fontFamily:'var(--fh)',fontWeight:700}}>Bonifico netto</td>
                      <td colSpan={8} style={{padding:'.82rem .8rem'}}>—</td>
                      <td style={{padding:'.82rem .8rem',fontFamily:'var(--fh)',fontWeight:800,fontSize:'1rem',color:'var(--acc2)'}}>{fmt(agg.bonifico)} €</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Crea mese */}
        <div style={{marginTop:'1.5rem',display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
          <button className="btn btn-danger" onClick={creaMese} disabled={creando || !giornate.length}>
            {creando ? <span className="spinner"/> : '📋'} Crea Mese
            <span style={{fontSize:'.73rem',opacity:.6,marginLeft:'.35rem'}}>(solo a fine mese)</span>
          </button>
          {msg && <span style={{fontSize:'.85rem',color:'#2ed573'}}>{msg}</span>}
        </div>
      </div>
    </div>
  )
}
