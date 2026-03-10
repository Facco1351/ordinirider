'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MESI, fmt } from '@/lib/calcoli'

export default function GuadagniPage() {
  const [anni, setAnni]       = useState([])
  const [anno, setAnno]       = useState(null)
  const [dati, setDati]       = useState([])
  const [loading, setLoading] = useState(false)
  const [selMese, setSelMese] = useState(null)

  useEffect(() => {
    fetch('/api/guadagni')
      .then(r => r.json())
      .then(d => {
        const uniq = [...new Set(d.map(r => r.anno))].sort((a,b)=>b-a)
        setAnni(uniq)
        if (uniq.length) { setAnno(uniq[0]); loadAnno(uniq[0]) }
      })
  }, [])

  async function loadAnno(a) {
    setLoading(true); setSelMese(null)
    const r = await fetch(`/api/guadagni?anno=${a}`)
    const d = await r.json()
    setDati(d); setLoading(false)
  }

  const totFat = dati.reduce((s,r)=>s+Number(r.fatturato),0)
  const totBon = dati.reduce((s,r)=>s+Number(r.bonifico),0)
  const totOrd = dati.reduce((s,r)=>s+Number(r.ordini),0)
  const diff   = totFat - 5000

  const meseDetail = selMese ? dati.find(d=>d.mese===selMese) : null

  return (
    <div style={{position:'relative',zIndex:1}}>
      <div className="page-header">
        <Link href="/dashboard" className="btn-icon">←</Link>
        <h2>I miei guadagni</h2>
      </div>
      <div className="page-content">

        {/* Anno selector */}
        <div className="anno-row">
          <span className="anno-label">Anno:</span>
          {anni.map(a=>(
            <button key={a} className={`ap${a===anno?' active':''}`}
              onClick={()=>{setAnno(a);loadAnno(a)}}>{a}</button>
          ))}
          {!anni.length && <span style={{fontSize:'.85rem',color:'var(--t3)'}}>Nessun dato — crea prima un mese dalle Giornate</span>}
        </div>

        {/* KPI annuali */}
        {anno && (
          <>
            <div className="kpi-grid kpi-grid-3 anim-up">
              <div className="kpi"><span className="kpi-icon">💰</span><div className="kpi-label">Fatturato</div><div className="kpi-value c-acc">{fmt(totFat)} €</div><div className="kpi-sub">anno {anno}</div></div>
              <div className="kpi anim-d1"><span className="kpi-icon">🏦</span><div className="kpi-label">Bonifico</div><div className="kpi-value c-ora">{fmt(totBon)} €</div></div>
              <div className="kpi anim-d2"><span className="kpi-icon">📦</span><div className="kpi-label">Ordini</div><div className="kpi-value c-grn">{totOrd}</div></div>
            </div>

            {/* Progress verso 5000 */}
            <div className="prog-wrap anim-up anim-d3">
              <div className="prog-labels">
                <span>Soglia 5.000 €</span>
                <span className="c-ora">{Math.min(100,(totFat/5000*100)).toFixed(1)}%</span>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{width:`${Math.min(100,totFat/5000*100)}%`}}/>
              </div>
            </div>
            <div style={{fontSize:'.82rem',color:diff>=0?'#2ed573':'#ff7f5c',marginTop:'-.8rem',marginBottom:'1.3rem'}}>
              {diff>=0 ? `✓ Soglia superata di ${fmt(diff)} €` : `Mancano ${fmt(Math.abs(diff))} € alla soglia`}
            </div>

            {/* Mesi grid */}
            <div className="section-label">Mesi</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.5rem',marginBottom:'1.3rem'}}>
              {MESI.map((m,i)=>{
                const r = dati.find(d=>d.mese===i+1)
                return (
                  <button key={i}
                    onClick={()=>setSelMese(selMese===i+1?null:i+1)}
                    style={{
                      padding:'.7rem .4rem',borderRadius:'var(--r)',textAlign:'center',
                      background: selMese===i+1 ? 'var(--red-soft)' : 'var(--bg3)',
                      border: `1px solid ${selMese===i+1?'rgba(255,69,32,.4)':'var(--border)'}`,
                      color: selMese===i+1 ? 'var(--acc)' : (r ? 'var(--t1)' : 'var(--t3)'),
                      cursor:'pointer',fontFamily:'var(--fb)',fontWeight:r?600:400,fontSize:'.85rem',
                      transition:'all .18s',
                    }}>
                    {m.slice(0,3)}
                    {r && <div style={{fontSize:'.68rem',color:selMese===i+1?'var(--acc)':'var(--t2)',marginTop:'.15rem'}}>{fmt(r.fatturato)} €</div>}
                  </button>
                )
              })}
            </div>

            {/* Dettaglio mese selezionato */}
            {meseDetail && (
              <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--rl)',padding:'1.25rem',animation:'fadeUp .3s var(--ease)'}}>
                <div style={{fontSize:'.95rem',fontFamily:'var(--fh)',color:'var(--acc)',marginBottom:'.9rem'}}>
                  {MESI[meseDetail.mese-1]} — Dettaglio
                </div>
                <div className="kpi-grid kpi-grid-3">
                  <div className="kpi"><div className="kpi-label">Fatturato</div><div className="kpi-value c-acc">{fmt(meseDetail.fatturato)} €</div></div>
                  <div className="kpi"><div className="kpi-label">Ordini</div><div className="kpi-value c-grn">{meseDetail.ordini}</div></div>
                  <div className="kpi"><div className="kpi-label">Bonifico</div><div className="kpi-value c-ora">{fmt(meseDetail.bonifico)} €</div></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
