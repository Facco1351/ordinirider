'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GIORNI, LUOGHI, calcolaGiornata, fmt } from '@/lib/calcoli'

const today = new Date().toISOString().split('T')[0]

export default function InserisciGiornata() {
  const router = useRouter()
  const [form, setForm] = useState({
    datag: today, giorno: GIORNI[0],
    numero_ordini: '', ordini_consegnati: '', incentivi: '',
    mance: '', contanti: '', benzina: '', km: '', luogo: LUOGHI[0],
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const preview = calcolaGiornata({
    ordini_consegnati: form.ordini_consegnati || 0,
    incentivi:         form.incentivi || 0,
    mance:             form.mance || 0,
    contanti:          form.contanti || 0,
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/giornate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setError('Errore di rete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <Link href="/dashboard" className="btn-icon">←</Link>
        <h2>Inserisci Giornata</h2>
      </div>

      {/* Live preview */}
      <div style={{borderBottom:'1px solid var(--border)',background:'linear-gradient(135deg,rgba(255,69,32,.08) 0%,transparent 70%)'}}>
        <div className="page-inner" style={{padding:'1rem 1.25rem',display:'flex',gap:'.75rem',flexWrap:'wrap'}}>
          {[
            {label:'Totale',     value:`${fmt(preview.totale)} €`,   color:'var(--acc)'},
            {label:'Tasse ~',    value:`${fmt(preview.tasse)} €`,    color:'#ff7f5c'},
            {label:'Bonifico ~', value:`${fmt(preview.bonifico)} €`, color:'var(--acc2)'},
          ].map(c=>(
            <div key={c.label} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'.6rem 1rem',minWidth:110,textAlign:'center'}}>
              <div style={{fontSize:'.65rem',textTransform:'uppercase',letterSpacing:'.09em',color:'var(--t2)',marginBottom:'.22rem'}}>{c.label}</div>
              <div style={{fontFamily:'var(--fh)',fontSize:'1.1rem',fontWeight:800,color:c.color}}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="page-content page-inner">
        {success && <div className="alert alert-ok">✓ Giornata salvata con successo!</div>}
        {error   && <div className="alert alert-err">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="section-label">Attività</div>
          <div className="form-grid">
            <div className="field">
              <label>Data</label>
              <input className="inp" type="date" value={form.datag} onChange={set('datag')} required/>
            </div>
            <div className="field">
              <label>Giorno</label>
              <select className="inp" value={form.giorno} onChange={set('giorno')}>
                {GIORNI.map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="field">
              <label>N° Ordini</label>
              <input className="inp" type="number" placeholder="0" min="0" inputMode="numeric"
                value={form.numero_ordini} onChange={set('numero_ordini')} required/>
            </div>
            <div className="field">
              <label>Luogo</label>
              <select className="inp" value={form.luogo} onChange={set('luogo')}>
                {LUOGHI.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="section-label" style={{marginTop:'1.4rem'}}>Guadagni</div>
          <div className="form-grid">
            {[
              {k:'ordini_consegnati', label:'Consegnati'},
              {k:'incentivi',         label:'Incentivi'},
              {k:'mance',             label:'Mance'},
              {k:'contanti',          label:'Contanti'},
            ].map(({k,label})=>(
              <div key={k} className="field">
                <label>{label}</label>
                <div className="inp-wrap">
                  <input className="inp has-unit" type="number" step="0.01" min="0"
                    placeholder="0.00" inputMode="decimal"
                    value={form[k]} onChange={set(k)} required/>
                  <span className="unit">€</span>
                </div>
              </div>
            ))}
          </div>

          <div className="section-label" style={{marginTop:'1.4rem'}}>Spese</div>
          <div className="form-grid">
            <div className="field">
              <label>Benzina</label>
              <div className="inp-wrap">
                <input className="inp has-unit" type="number" step="0.01" min="0"
                  placeholder="0.00" inputMode="decimal"
                  value={form.benzina} onChange={set('benzina')} required/>
                <span className="unit">€</span>
              </div>
            </div>
            <div className="field">
              <label>Km percorsi</label>
              <div className="inp-wrap">
                <input className="inp has-unit" type="number" step="0.1" min="0"
                  placeholder="0" inputMode="decimal"
                  value={form.km} onChange={set('km')} required/>
                <span className="unit">km</span>
              </div>
            </div>
          </div>

          <div style={{marginTop:'1.5rem'}}>
            <button className="btn btn-primary" style={{minWidth:240}} type="submit" disabled={loading}>
              {loading ? <span className="spinner"/> : 'Aggiungi Giornata →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
