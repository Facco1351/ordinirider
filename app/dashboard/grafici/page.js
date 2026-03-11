'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { MESI_SHORT, fmt } from '@/lib/calcoli'

const CF = '#ff4520', CFB = 'rgba(255,69,32,.13)'
const CB = '#ff8c3a', CBB = 'rgba(255,140,58,.11)'
const CO = '#a8f5b0', COB = 'rgba(168,245,176,.09)'
const fmtE = v => Number(v).toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'
const fmtN = v => Number(v).toLocaleString('it-IT')

function KP({ label, value, color }) {
  return (
    <div style={{textAlign:'center'}}>
      <div className="kp-l">{label}</div>
      <div className="kp-v" style={color?{color}:{}}>{value}</div>
    </div>
  )
}

function ChartBox({ id, height = 260 }) {
  return <div style={{position:'relative',height}}><canvas id={id}/></div>
}

export default function GraficiPage() {
  const [tab, setTab]     = useState('mensile')
  const [anni, setAnni]   = useState([])
  const [anno, setAnno]   = useState(null)
  const [dm, setDm]       = useState(Array(12).fill({fatturato:0,bonifico:0,ordini:0}))
  const [da, setDa]       = useState([])
  const [vis, setVis]     = useState({f:true,b:true,o:true})
  const [ready, setReady] = useState(false)
  const [kpiM, setKpiM]   = useState(null)
  const charts = useRef({})

  // Init Chart.js una sola volta lato client
  useEffect(() => {
    import('chart.js').then(m => {
      m.Chart.register(...m.registerables)
      window.__ChartJS = m.Chart
      // defaults
      m.Chart.defaults.color       = '#8a8896'
      m.Chart.defaults.borderColor = 'rgba(255,255,255,0.07)'
      m.Chart.defaults.font.family = "'DM Sans',sans-serif"
      setReady(true)
    })
  }, [])

  // Load dati annuali
  useEffect(() => {
    fetch('/api/grafici/annuale').then(r=>r.json()).then(d=>{
      setDa(d)
      const as = d.map(r=>r.anno)
      setAnni(as)
      if (as.length) { setAnno(as[as.length-1]); loadMensile(as[as.length-1]) }
    })
  }, [])

  async function loadMensile(a) {
    const r = await fetch(`/api/grafici/mensile?anno=${a}`)
    const d = await r.json()
    setDm(d)
  }

  function makeDs(label, data, c, bg) {
    return {
      label, data,
      borderColor: c, backgroundColor: bg,
      borderWidth: 2.5, tension: 0.42, fill: true,
      pointBackgroundColor: c, pointBorderColor: 'transparent',
      pointRadius: 4, pointHoverRadius: 7,
    }
  }

  function makeOpts(fmtFn) {
    return {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e1e2a',
          borderColor: 'rgba(255,255,255,.1)', borderWidth:1, padding:12,
          titleFont: { family:"'Syne',sans-serif", weight:'700', size:13 },
          bodyFont:  { size:12 },
          callbacks: { label: c => ' '+c.dataset.label+': '+fmtFn(c.parsed.y) },
        },
      },
      scales: {
        x: { grid:{color:'rgba(255,255,255,.04)'}, ticks:{color:'#888594',font:{size:11}} },
        y: { grid:{color:'rgba(255,255,255,.05)'}, ticks:{color:'#888594',callback:v=>fmtFn(v),font:{size:11}}, beginAtZero:true },
      },
    }
  }

  function destroyChart(key) {
    if (charts.current[key]) { charts.current[key].destroy(); delete charts.current[key] }
  }

  function makeChart(canvasId, key, datasets, labels, fmtFn) {
    const C = window.__ChartJS
    if (!C) return
    const el = document.getElementById(canvasId)
    if (!el) return
    destroyChart(key)
    charts.current[key] = new C(el.getContext('2d'), {
      type: 'line',
      data: { labels, datasets },
      options: makeOpts(fmtFn),
    })
  }

  // Rebuild grafici mensili quando cambiano dati o visibilità
  useEffect(() => {
    if (!ready || tab !== 'mensile') return
    // piccolo delay per assicurarsi che i canvas siano montati
    const t = setTimeout(() => {
      const euroDs = []
      if (vis.f) euroDs.push(makeDs('Fatturato', dm.map(d=>d.fatturato), CF, CFB))
      if (vis.b) euroDs.push(makeDs('Bonifico',  dm.map(d=>d.bonifico),  CB, CBB))

      if (euroDs.length) makeChart('ch-m-euro','m-euro', euroDs, MESI_SHORT, fmtE)
      else destroyChart('m-euro')

      if (vis.o) makeChart('ch-m-ord','m-ord', [makeDs('Ordini',dm.map(d=>d.ordini),CO,COB)], MESI_SHORT, fmtN)
      else destroyChart('m-ord')

      // KPI
      const totF = dm.reduce((s,d)=>s+d.fatturato,0)
      const totB = dm.reduce((s,d)=>s+d.bonifico,0)
      const totO = dm.reduce((s,d)=>s+d.ordini,0)
      const att  = dm.filter(d=>d.fatturato>0).length
      const bF   = Math.max(...dm.map(d=>d.fatturato))
      const bMI  = dm.findIndex(d=>d.fatturato===bF)
      setKpiM({ totF, totB, totO, att, bF, bMI })
    }, 60)
    return () => clearTimeout(t)
  }, [ready, tab, dm, vis])

  // Rebuild grafici annuali al cambio tab
  useEffect(() => {
    if (!ready || tab !== 'annuale' || !da.length) return
    const t = setTimeout(() => {
      const labA = da.map(d=>String(d.anno))
      makeChart('ch-a-fat','a-fat',[makeDs('Fatturato',da.map(d=>d.fatturato),CF,CFB)],labA,fmtE)
      makeChart('ch-a-bon','a-bon',[makeDs('Bonifico', da.map(d=>d.bonifico), CB,CBB)],labA,fmtE)
      makeChart('ch-a-ord','a-ord',[makeDs('Ordini',   da.map(d=>d.ordini),   CO,COB)],labA,fmtN)
    }, 60)
    return () => clearTimeout(t)
  }, [ready, tab, da])

  // Cleanup
  useEffect(() => () => Object.keys(charts.current).forEach(k=>destroyChart(k)), [])

  function switchTab(t) {
    setTab(t)
  }

  async function selectAnno(a) {
    setAnno(a)
    await loadMensile(a)
  }

  if (!ready) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',position:'relative',zIndex:1}}>
      <span className="spinner"/>
    </div>
  )

  const labA = da.map(d=>String(d.anno))
  const fatA = da.map(d=>d.fatturato)
  const bonA = da.map(d=>d.bonifico)
  const ordA = da.map(d=>d.ordini)

  return (
    <div className="page-wrap">
      {/* Hero */}
      <div style={{background:'linear-gradient(135deg,rgba(255,69,32,.1) 0%,rgba(255,140,58,.04) 55%,transparent 100%)',borderBottom:'1px solid var(--border)',padding:'1.5rem 1.5rem 1.25rem',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-50%',right:'-8%',width:300,height:300,background:'radial-gradient(circle,rgba(255,69,32,.07) 0%,transparent 65%)',pointerEvents:'none'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">← Home</Link>
        </div>
        <h1 style={{fontFamily:'var(--fh)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:800,letterSpacing:'-.04em',marginBottom:'.3rem'}}>
          Le tue <span style={{color:'var(--acc)'}}>statistiche</span>
        </h1>
        <p style={{fontSize:'.87rem',color:'var(--t2)'}}>Fatturato · Bonifico · Ordini — per mese e per anno</p>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn${tab==='mensile'?' active':''}`} onClick={()=>switchTab('mensile')}>📅 Per mese</button>
        <button className={`tab-btn${tab==='annuale'?' active':''}`} onClick={()=>switchTab('annuale')}>📆 Per anno</button>
      </div>

      <div className="page-content page-inner-wide">

        {/* ── MENSILE ── */}
        {tab === 'mensile' && (
          !anni.length ? (
            <div style={{textAlign:'center',padding:'4rem 1rem',color:'var(--t2)'}}>
              <div style={{fontSize:'3rem',marginBottom:'1rem',opacity:.45}}>📊</div>
              <p>Nessun dato disponibile.<br/>Crea prima un mese dalla pagina Giornate.</p>
            </div>
          ) : (
            <>
              {/* Anno pills */}
              <div className="anno-row">
                <span className="anno-label">Anno:</span>
                {anni.map(a=>(
                  <button key={a} className={`ap${a===anno?' active':''}`} onClick={()=>selectAnno(a)}>{a}</button>
                ))}
              </div>

              {/* Metric toggles */}
              <div className="pill-row">
                <button className={`pill pf${vis.f?' on':''}`} onClick={()=>setVis(v=>({...v,f:!v.f}))}>
                  <span className="dot" style={{background:CF}}/>Fatturato
                </button>
                <button className={`pill pb${vis.b?' on':''}`} onClick={()=>setVis(v=>({...v,b:!v.b}))}>
                  <span className="dot" style={{background:CB}}/>Bonifico
                </button>
                <button className={`pill po${vis.o?' on':''}`} onClick={()=>setVis(v=>({...v,o:!v.o}))}>
                  <span className="dot" style={{background:CO}}/>Ordini
                </button>
              </div>

              {/* Grafico euro */}
              {(vis.f || vis.b) && (
                <div className="chart-card anim-up" style={{marginBottom:'1.2rem'}}>
                  <div style={{marginBottom:'1.2rem'}}>
                    <div className="chart-card-title">Andamento {anno}</div>
                    <div className="chart-card-sub">Fatturato e bonifico mese per mese (€)</div>
                  </div>
                  <ChartBox id="ch-m-euro" height={280}/>
                  {kpiM && (
                    <div className="kpi-strip">
                      <KP label="Fatturato tot." value={fmtE(kpiM.totF)} color={CF}/>
                      <KP label="Bonifico tot."  value={fmtE(kpiM.totB)} color={CB}/>
                      <KP label="Mese top" value={`${MESI_SHORT[kpiM.bMI]} · ${fmtE(kpiM.bF)}`}/>
                      <KP label="Media mensile" value={fmtE(kpiM.att ? kpiM.totF/kpiM.att : 0)}/>
                    </div>
                  )}
                </div>
              )}

              {/* Grafico ordini */}
              {vis.o && (
                <div className="chart-card anim-up anim-d1" style={{marginBottom:'1.2rem'}}>
                  <div style={{marginBottom:'1.2rem'}}>
                    <div className="chart-card-title">📦 Ordini mensili {anno}</div>
                    <div className="chart-card-sub">Numero ordini consegnati ogni mese</div>
                  </div>
                  <ChartBox id="ch-m-ord" height={220}/>
                  {kpiM && (
                    <div className="kpi-strip">
                      <KP label="Ordini tot." value={fmtN(kpiM.totO)} color={CO}/>
                      <KP label="Media mensile" value={fmtN(kpiM.att ? Math.round(kpiM.totO/kpiM.att) : 0)}/>
                    </div>
                  )}
                </div>
              )}
            </>
          )
        )}

        {/* ── ANNUALE ── */}
        {tab === 'annuale' && (
          !da.length ? (
            <div style={{textAlign:'center',padding:'4rem 1rem',color:'var(--t2)'}}>
              <div style={{fontSize:'3rem',marginBottom:'1rem',opacity:.45}}>📆</div>
              <p>Nessun dato annuale disponibile.</p>
            </div>
          ) : (
            <>
              {/* Fatturato */}
              <div className="chart-card anim-up" style={{marginBottom:'1.2rem'}}>
                <div style={{marginBottom:'1.2rem'}}>
                  <div className="chart-card-title">💰 Fatturato annuale</div>
                  <div className="chart-card-sub">Fatturato lordo totale per ogni anno (€)</div>
                </div>
                <ChartBox id="ch-a-fat" height={260}/>
                <div className="kpi-strip">
                  <KP label="Totale cumulato" value={fmtE(fatA.reduce((a,b)=>a+b,0))} color={CF}/>
                  <KP label="Anno top" value={fatA.length ? `${labA[fatA.indexOf(Math.max(...fatA))]} · ${fmtE(Math.max(...fatA))}` : '—'}/>
                  <KP label="Media annua" value={fmtE(fatA.length ? fatA.reduce((a,b)=>a+b,0)/fatA.length : 0)}/>
                </div>
              </div>

              {/* Bonifico */}
              <div className="chart-card anim-up anim-d1" style={{marginBottom:'1.2rem'}}>
                <div style={{marginBottom:'1.2rem'}}>
                  <div className="chart-card-title">🏦 Bonifico netto annuale</div>
                  <div className="chart-card-sub">Importo netto ricevuto ogni anno (€)</div>
                </div>
                <ChartBox id="ch-a-bon" height={260}/>
                <div className="kpi-strip">
                  <KP label="Totale cumulato" value={fmtE(bonA.reduce((a,b)=>a+b,0))} color={CB}/>
                  <KP label="Anno top" value={bonA.length ? `${labA[bonA.indexOf(Math.max(...bonA))]} · ${fmtE(Math.max(...bonA))}` : '—'}/>
                  <KP label="Media annua" value={fmtE(bonA.length ? bonA.reduce((a,b)=>a+b,0)/bonA.length : 0)}/>
                </div>
              </div>

              {/* Ordini */}
              <div className="chart-card anim-up anim-d2" style={{marginBottom:'1.2rem'}}>
                <div style={{marginBottom:'1.2rem'}}>
                  <div className="chart-card-title">📦 Ordini annuali</div>
                  <div className="chart-card-sub">Numero totale ordini consegnati ogni anno</div>
                </div>
                <ChartBox id="ch-a-ord" height={260}/>
                <div className="kpi-strip">
                  <KP label="Totale ordini" value={fmtN(ordA.reduce((a,b)=>a+b,0))} color={CO}/>
                  <KP label="Anno top" value={ordA.length ? `${labA[ordA.indexOf(Math.max(...ordA))]} · ${fmtN(Math.max(...ordA))}` : '—'}/>
                  <KP label="Media annua" value={fmtN(ordA.length ? Math.round(ordA.reduce((a,b)=>a+b,0)/ordA.length) : 0)}/>
                </div>
              </div>
            </>
          )
        )}

      </div>
    </div>
  )
}
