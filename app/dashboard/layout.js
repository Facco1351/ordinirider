import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashNav from '@/components/DashNav'

export default async function DashboardLayout({ children }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',position:'relative',zIndex:1}}>
      <DashNav session={session} />
      <main style={{flex:1}}>
        {children}
      </main>
    </div>
  )
}
