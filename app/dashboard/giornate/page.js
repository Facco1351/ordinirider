'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MESI } from '@/lib/calcoli'

const anni = [2023, 2024, 2025, 2026]

export default function GiornateIndexPage() {
  const router = useRouter()
  const now    = new Date()
  const [anno, setAnno] = useState(now.getFullYear())
  const [mese, setMese] = useState(now.getMonth() + 1)

  return (
    <div style={{position:'relative',zIndex:1}}>
      <div className="page-header">
        <Link href="/dashboard" className="btn-icon">←</Link>
        <h2>Visualizza Giornate</h2>
      </div>
      <div className="page-content" style={{maxWidth:480}}>
        <div className="field">
          <label>Anno</label>
          <select className="inp" value={anno} onChange={e=>setAnno(Number(e.target.value))}>
            {anni.map(a=><option key={a}>{a}</option>)}
          </select>
        </div>
        <div className="field" style={{marginBottom:'1.5rem'}}>
          <label>Mese</label>
          <select className="inp" value={mese} onChange={e=>setMese(Number(e.target.value))}>
            {MESI.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-full"
          onClick={()=>router.push(`/dashboard/giornate/${anno}/${mese}`)}>
          Visualizza →
        </button>
      </div>
    </div>
  )
}
