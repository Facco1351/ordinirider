'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../login/auth.module.css'

export default function RegistrazionePage() {
  const router = useRouter()
  const [form, setForm] = useState({ nome:'', cognome:'', username:'', email:'', password:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Errore registrazione'); return }
      router.push('/login?registered=1')
    } catch {
      setError('Errore di rete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className="card anim-up z1" style={{maxWidth:480,margin:'0 auto'}}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🛵</div>
          <span className={styles.logoText}>RiderDash</span>
        </div>
        <h1 className={styles.title}>Crea account</h1>
        <p className={styles.sub}>Inizia a tracciare le tue consegne</p>

        {error && <div className="alert alert-err">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="field" style={{margin:0}}>
              <label>Nome</label>
              <input className="inp" placeholder="Mario" value={form.nome} onChange={set('nome')} autoCapitalize="words" required/>
            </div>
            <div className="field" style={{margin:0}}>
              <label>Cognome</label>
              <input className="inp" placeholder="Rossi" value={form.cognome} onChange={set('cognome')} autoCapitalize="words" required/>
            </div>
          </div>
          <div className="field" style={{marginTop:'.85rem'}}>
            <label>Username</label>
            <input className="inp" placeholder="mario_rossi" value={form.username} onChange={set('username')} autoCapitalize="none" required/>
          </div>
          <div className="field">
            <label>Email</label>
            <input className="inp" type="email" placeholder="mario@email.it" value={form.email} onChange={set('email')} inputMode="email" required/>
          </div>
          <div className="field">
            <label>Password</label>
            <input className="inp" type="password" placeholder="minimo 6 caratteri" value={form.password} onChange={set('password')} required/>
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner"/> : 'Crea account →'}
          </button>
        </form>

        <p className={styles.foot}>
          Hai già un account? <Link href="/login">Accedi</Link>
        </p>
      </div>
    </div>
  )
}
