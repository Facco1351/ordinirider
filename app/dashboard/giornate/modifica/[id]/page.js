'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GIORNI, LUOGHI, calcolaGiornata, MESI_SHORT, fmt } from '@/lib/calcoli'

export default function ModificaGiornata({ params }) {
  const { id }   = params
  const router   = useRouter()
  const [form, setForm]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [delModal, setDelModal] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch(`/api/giornate/${id}`)
      .then(r => r.json())
      .then(d => { setForm(d); setLoading(false) })
  }, [id])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const preview = form ? calcolaGiornata(form) : { totale:0, tasse:0, bonifico:0 }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch(`/api/giornate/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      const d = form.datag ? new Date(form.datag) : new Date()
      router.push(`/dashboard/giornate/${d.getUTCFullYear()}/${d.getUTCMonth()+1}`)
    } else {
      const d = await res.json(); setError(d.error)
    }
  }

  async function handleDelete() {
    await fetch(`/api/giornate/${id}`, { method: 'DELETE' })
    router.push('/dashboard/giornate')
  }

  if (loading) return <div style={{padding:'2rem',textAlign:'center',color:'var(--t2)'}}>Caricamento...</div>

  const dt    = new Date(form.datag)
  const dateFmt = `${String(dt.getUTCDate()).padStart(2,'0')} ${MESI_SHORT[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`

  return (
    <div style={{position:'relative',zIndex:1}}>
      {/* Top nav */}
      <div className="page-header">
        <button className="btn-icon" onClick={()=>router.back()}>←</button>
        <h2>Modifica Giornata</h2>
      </div>

      {/* Date hero */}
      <div style={{background:'linear-gradient(135deg,rgba(255,69,32,.1) 0%,transparent 65%)',borderBottom:'1px solid var(--border)',padding:'1.5rem 1.25rem',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:'.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'var(--t2)',marginBottom:'.3rem'}}>Stai modificando</div>
          <div style={{fontFamily:'var(--fh)',fontSize:'1.75rem',fontWeight:800,letterSpacing:'-.04em',lineHeight:1}}>{dateFmt}</div>
          <div style={{fontSize:'.88rem',color:'var(--t2)',marginTop:'.3rem'}}>{form.giorno}</div>
        </div>
        <div style={{display:'flex',gap:'.65rem',flexWrap:'wrap'}}>
          {[
            {label:'Totale',  v:fmt(preview.totale)+' €', c:'var(--acc)'},
            {label:'Tasse ~', v:fmt(preview.tasse)+' €',  c:'#ff7f5c'},
          ].map(c=>(
            <div key={c.label} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'.6rem 1rem',minWidth:110,textAlign:'center'}}>
              <div style={{fontSize:'.65rem',textTransform:'uppercase',letterSpacing:'.09em',color:'var(--t2)',marginBottom:'.2rem'}}>{c.label}</div>
              <div style={{fontFamily:'var(--fh)',fontSize:'1.1rem',fontWeight:800,color:c.c}}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-err" style={{margin:'1rem 1.25rem 0'}}>{error}</div>}

      {/* Form */}
      <form onSubmit={handleSave}>
        <div className="page-content" style={{maxWidth:700}}>
          <div className="section-label">Attività</div>
          <div className="form-grid">
            <div className="field">
              <label>N° Ordini</label>
              <input className="inp" type="number" min="0" inputMode="numeric"
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
              {k:'ordini_consegnati',label:'Consegnati'},
              {k:'incentivi',        label:'Incentivi'},
              {k:'mance',            label:'Mance'},
              {k:'contanti',         label:'Contanti'},
            ].map(({k,label})=>(
              <div key={k} className="field">
                <label>{label}</label>
                <div className="inp-wrap">
                  <input className="inp has-unit" type="number" step="0.01" min="0" inputMode="decimal"
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
                <input className="inp has-unit" type="number" step="0.01" min="0" inputMode="decimal"
                  value={form.benzina} onChange={set('benzina')} required/>
                <span className="unit">€</span>
              </div>
            </div>
            <div className="field">
              <label>Km</label>
              <div className="inp-wrap">
                <input className="inp has-unit" type="number" step="0.1" min="0" inputMode="decimal"
                  value={form.km} onChange={set('km')} required/>
                <span className="unit">km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky action bar */}
        <div style={{position:'sticky',bottom:0,background:'var(--bg1)',borderTop:'1px solid var(--border)',padding:'1rem 1.25rem calc(1rem + env(safe-area-inset-bottom,0px))',display:'flex',gap:'.75rem',zIndex:50}}>
          <button type="button" className="btn btn-danger" onClick={()=>setDelModal(true)}>🗑 Elimina</button>
          <button type="submit" className="btn btn-primary" style={{flex:1}} disabled={saving}>
            {saving ? <span className="spinner"/> : '💾 Salva modifiche'}
          </button>
        </div>
      </form>

      {/* Delete modal */}
      {delModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDelModal(false)}>
          <div className="modal">
            <div className="modal-icon">⚠️</div>
            <h3>Eliminare questa giornata?</h3>
            <p>L&apos;operazione è irreversibile. I dati di <strong>{dateFmt}</strong> saranno cancellati definitivamente.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setDelModal(false)}>Annulla</button>
              <button className="btn btn-danger" style={{flex:1}} onClick={handleDelete}>Sì, elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
