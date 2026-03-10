'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './DashNav.module.css'

export default function DashNav({ session }) {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className={styles.nav}>
      <div className={styles.left}>
        <div className={styles.logoIcon}>🛵</div>
        <span className={styles.logoText}>RiderDash</span>
      </div>
      <div className={styles.right}>
        <span className={styles.username}>@{session.username}</span>
        <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
      </div>
    </header>
  )
}
