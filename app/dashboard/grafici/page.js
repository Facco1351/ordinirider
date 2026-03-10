'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MESI_SHORT, fmt } from '@/lib/calcoli'

// Palette
const CF = '#ff4520', CFB = 'rgba(255,69,32,.13)'
const CB = '#ff8c3a', CBB = 'rgba(255,140,58,.11)'
const CO = '#a8f5b0', COB = 'rgba(168,245,176,.09)'

function ds(label, data, c, bg) {
  return {
    label, data,
    borderColor: c, backgroundColor: bg,
    borderWidth: 2.5, tension: 0.42, fill: true,
    pointBackgroundColor: c, pointBorderColor: 'transparent',
    pointRadius: 4, pointHoverRadius: 7,
  }
}

function baseOpts(fmt_fn) {
  return {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1e2a',
        borderColor: 'rgba(255,255,255,.1)', borderWidth: 1, padding: 12,
        titleFont: { family: "'Syne',sans-serif", weight: '700', size: 13 },
        bodyFont: { size: 12 },
        callbacks: { label: c => ' ' + c.dataset.label + ': ' + fmt_fn(c.parsed.y) },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#888594', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#888594', callback: v => fmt_fn(v), font: { size: 11 } }, beginAtZero: true },
    },
  }
}

function ChartCard({ title, sub, height = 260, children, kpiContent }) {
  return (
    <div className="chart-card anim-up" style={{ marginBottom: '1.2rem' }}>
      <div style={{ marginBottom: '1.2rem' }}>
        <div className="chart-card-title">{title}</div>
        <div className="chart-card-sub">{sub}</div>
      </div>
      <div style={{ position: 'relative', height }}>{children}</div>
      {kpiContent && (
        <div className="kpi-strip">{kpiContent}</div>
      )}
    </div>
  )
}

function KP({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="kp-l">{label}</div>
      <div className="kp-v" style={color ? { color } : {}}>{value}</div>
    </div>
  )
}

export default function GraficiPage() {
  const [tab, setTab]       = useState('mensile')
  const [anni, setAnni]     = useState([])
  const [anno, setAnno]     = useState(null)
  const [dm, setDm]         = useState(Array(12).fill({ fatturato: 0, bonifico: 0, ordini: 0 }))
  const [da, setDa]         = useState([])
  const [vis, setVis]       = useState({ f: true, b: true, o: true })
  const [ChartJS, setCJ]    = useState(null)
  const [Line, setLine]     = useState(null)

  // Lazy-load Chart.js only client-side
  useEffect(() => {
    import('chart.js').then(m => {
      m.Chart.register(...m.registerables)
      setCJ(m.Chart)
    })
    import('react-chartjs-2').then(m => setLine(() => m.Line))
  }, [])

  // Load anni
  useEffect(() => {
    fetch('/api/grafici/annuale').then(r => r.json()).then(d => {
      setDa(d)
      const as = d.map(r => r.anno)
      setAnni(as)
      if (as.length) { setAnno(as[as.length - 1]); loadMensile(as[as.length - 1]) }
    })
  }, [])

  async function loadMensile(a) {
    const r = await fetch(`/api/grafici/mensile?anno=${a}`)
    const d = await r.json()
    setDm(d)
  }

  function togVis(k) { setVis(v => ({ ...v, [k]: !v[k] })) }

  if (!Line || !ChartJS) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--t2)', position: 'relative', zIndex: 1 }}>
      <span className="spinner" />
    </div>
  )

  // Mensile datasets
  const euroDs = []
  if (vis.f) euroDs.push(ds('Fatturato', dm.map(d => d.fatturato), CF, CFB))
  if (vis.b) euroDs.push(ds('Bonifico',  dm.map(d => d.bonifico),  CB, CBB))
  const ordDs = [ds('Ordini', dm.map(d => d.ordini), CO, COB)]

  // KPI mensili
  const totF = dm.reduce((s,d)=>s+d.fatturato,0)
  const totB = dm.reduce((s,d)=>s+d.bonifico,0)
  const totO = dm.reduce((s,d)=>s+d.ordini,0)
  const attivi = dm.filter(d=>d.fatturato>0).length
  const bestF  = Math.max(...dm.map(d=>d.fatturato))
  const bestMI = dm.findIndex(d=>d.fatturato===bestF)

  // Annuali
  const labA = da.map(d => String(d.anno))
  const fatA = da.map(d => d.fatturato)
  const bonA = da.map(d => d.bonifico)
  const ordA = da.map(d => d.ordini)
  const fmtN = v => Number(v).toLocaleString('it-IT')
  const fmtE = v => Number(v).toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,rgba(255,69,32,.1) 0%,rgba(255,140,58,.04) 55%,transparent 100%)', borderBottom: '1px solid var(--border)', padding: '1.5rem 1.5rem 1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-8%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(255,69,32,.07) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">← Home</Link>
        </div>
        <h1 style={{ fontFamily: 'var(--fh)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: '.3rem' }}>
          Le tue <span style={{ color: 'var(--acc)' }}>statistiche</span>
        </h1>
        <p style={{ fontSize: '.87rem', color: 'var(--t2)' }}>Fatturato · Bonifico · Ordini — per mese e per anno</p>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn${tab==='mensile'?' active':''}`} onClick={()=>setTab('mensile')}>📅 Per mese</button>
        <button className={`tab-btn${tab==='annuale'?' active':''}`} onClick={()=>setTab('annuale')}>📆 Per anno</button>
      </div>

      <div style={{ padding: '1.5rem' }}>

        {/* ── MENSILE ── */}
        {tab === 'mensile' && (
          <>
            {!anni.length ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--t2)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: .45 }}>📊</div>
                <p>Nessun dato disponibile.<br />Crea dei mesi dalla pagina Giornate.</p>
              </div>
            ) : (
              <>
                {/* Anno pills */}
                <div className="anno-row">
                  <span className="anno-label">Anno:</span>
                  {anni.map(a=>(
                    <button key={a} className={`ap${a===anno?' active':''}`}
                      onClick={()=>{setAnno(a);loadMensile(a)}}>{a}</button>
                  ))}
                </div>

                {/* Metric toggles */}
                <div className="pill-row">
                  <button className={`pill pf${vis.f?' on':''}`} onClick={()=>togVis('f')}>
                    <span className="dot" style={{background:CF}}/>Fatturato
                  </button>
                  <button className={`pill pb${vis.b?' on':''}`} onClick={()=>togVis('b')}>
                    <span className="dot" style={{background:CB}}/>Bonifico
                  </button>
                  <button className={`pill po${vis.o?' on':''}`} onClick={()=>togVis('o')}>
                    <span className="dot" style={{background:CO}}/>Ordini
                  </button>
                </div>

                {/* Grafico euro */}
                {(vis.f || vis.b) && (
                  <ChartCard
                    title={`Andamento ${anno}`}
                    sub="Fatturato e bonifico mese per mese (€)"
                    height={280}
                    kpiContent={<>
                      <KP label="Fatturato tot." value={fmtE(totF)} color={CF}/>
                      <KP label="Bonifico tot."  value={fmtE(totB)} color={CB}/>
                      <KP label="Mese top" value={`${MESI_SHORT[bestMI]} · ${fmtE(bestF)}`}/>
                      <KP label="Media mensile" value={fmtE(attivi?totF/attivi:0)}/>
                    </>}
                  >
                    <Line data={{ labels: MESI_SHORT, datasets: euroDs }} options={baseOpts(fmtE)} />
                  </ChartCard>
                )}

                {/* Grafico ordini */}
                {vis.o && (
                  <ChartCard title="📦 Ordini mensili" sub="Numero ordini consegnati ogni mese" height={220}
                    kpiContent={<>
                      <KP label="Ordini tot." value={fmtN(totO)} color={CO}/>
                      <KP label="Media mensile" value={fmtN(attivi?Math.round(totO/attivi):0)}/>
                    </>}
                  >
                    <Line data={{ labels: MESI_SHORT, datasets: ordDs }} options={baseOpts(fmtN)} />
                  </ChartCard>
                )}
              </>
            )}
          </>
        )}

        {/* ── ANNUALE ── */}
        {tab === 'annuale' && (
          <>
            {!da.length ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--t2)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: .45 }}>📆</div>
                <p>Nessun dato annuale disponibile.</p>
              </div>
            ) : (
              <>
                {/* Fatturato annuale */}
                <ChartCard title="💰 Fatturato annuale" sub="Fatturato lordo totale per ogni anno (€)" height={260}
                  kpiContent={<>
                    <KP label="Totale cumulato" value={fmtE(fatA.reduce((a,b)=>a+b,0))} color={CF}/>
                    <KP label="Anno top" value={`${labA[fatA.indexOf(Math.max(...fatA))]} · ${fmtE(Math.max(...fatA))}`}/>
                    <KP label="Media annua" value={fmtE(fatA.length?fatA.reduce((a,b)=>a+b,0)/fatA.length:0)}/>
                  </>}
                >
                  <Line data={{ labels: labA, datasets: [ds('Fatturato',fatA,CF,CFB)] }} options={baseOpts(fmtE)} />
                </ChartCard>

                {/* Bonifico annuale */}
                <ChartCard title="🏦 Bonifico netto annuale" sub="Importo netto ricevuto ogni anno (€)" height={260}
                  kpiContent={<>
                    <KP label="Totale cumulato" value={fmtE(bonA.reduce((a,b)=>a+b,0))} color={CB}/>
                    <KP label="Anno top" value={`${labA[bonA.indexOf(Math.max(...bonA))]} · ${fmtE(Math.max(...bonA))}`}/>
                    <KP label="Media annua" value={fmtE(bonA.length?bonA.reduce((a,b)=>a+b,0)/bonA.length:0)}/>
                  </>}
                >
                  <Line data={{ labels: labA, datasets: [ds('Bonifico',bonA,CB,CBB)] }} options={baseOpts(fmtE)} />
                </ChartCard>

                {/* Ordini annuali */}
                <ChartCard title="📦 Ordini annuali" sub="Numero totale ordini consegnati ogni anno" height={260}
                  kpiContent={<>
                    <KP label="Totale ordini" value={fmtN(ordA.reduce((a,b)=>a+b,0))} color={CO}/>
                    <KP label="Anno top" value={`${labA[ordA.indexOf(Math.max(...ordA))]} · ${fmtN(Math.max(...ordA))}`}/>
                    <KP label="Media annua" value={fmtN(ordA.length?Math.round(ordA.reduce((a,b)=>a+b,0)/ordA.length):0)}/>
                  </>}
                >
                  <Line data={{ labels: labA, datasets: [ds('Ordini',ordA,CO,COB)] }} options={baseOpts(fmtN)} />
                </ChartCard>
              </>
            )}
          </>
        )}

      </div>
    </div>
  )
}
