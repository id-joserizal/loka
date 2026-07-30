import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const { count: pendingReportsCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-zinc-900 flex flex-col md:flex-row">
      <AdminSidebar pendingReportsCount={pendingReportsCount || 0} />
      <main className="flex-1 p-4 sm:p-8 md:p-10 max-w-7xl w-full mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
