'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './auth.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]   = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Errore login'); return }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Errore di rete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={`card anim-up z1`} style={{margin:'0 auto'}}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🛵</div>
          <span className={styles.logoText}>RiderDash</span>
        </div>
        <h1 className={styles.title}>Bentornato</h1>
        <p className={styles.sub}>Accedi al tuo pannello di controllo</p>

        {error && <div className="alert alert-err">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input className="inp" placeholder="il_tuo_username"
              value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value}))}
              autoCapitalize="none" autoComplete="username" required/>
          </div>
          <div className="field">
            <label>Password</label>
            <input className="inp" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))}
              autoComplete="current-password" required/>
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner"/> : 'Accedi →'}
          </button>
        </form>

        <p className={styles.foot}>
          Nessun account? <Link href="/registrazione">Registrati</Link>
        </p>
      </div>
    </div>
  )
}
