import { getSession } from '@/lib/session'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()

  return (
    <div style={{padding:'1.5rem',maxWidth:480,margin:'0 auto'}}>
      <div className="greeting anim-up">
        <div className="greeting-name">Ciao, {session.nome} {session.cognome} 👋</div>
        <div className="greeting-sub">@{session.username}</div>
      </div>

      <ul className="menu-list anim-up anim-d1">
        <li>
          <Link href="/dashboard/guadagni" className="menu-item">
            <div className="mi-icon">💰</div>
            <span className="mi-label">I miei guadagni</span>
            <span className="mi-arrow">›</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/giornate/inserisci" className="menu-item">
            <div className="mi-icon">➕</div>
            <span className="mi-label">Inserisci Giornata</span>
            <span className="mi-arrow">›</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/giornate" className="menu-item">
            <div className="mi-icon">📅</div>
            <span className="mi-label">Visualizza Giornate</span>
            <span className="mi-arrow">›</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/grafici" className="menu-item">
            <div className="mi-icon">📈</div>
            <span className="mi-label">Grafici & Statistiche</span>
            <span className="mi-arrow">›</span>
          </Link>
        </li>
      </ul>
    </div>
  )
}
