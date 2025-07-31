// app/dashboard/layout.tsx

import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { LogoutButton } from "@/components/ui/logoutbutton"
import "@/app/globals.css"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-6 flex flex-col">
        <h2 className="text-xl font-bold">RBAC Tool</h2>
        <nav className="flex flex-col gap-3" aria-label="Sidebar Navigation">
          <Link href="/dashboard">
            <span className="hover:underline">Home</span>
          </Link>
          <Link href="/dashboard/user-roles">
            <span className="hover:underline">Assign Roles</span>
          </Link>
          <Link href="/dashboard/permissions">
            <span className="hover:underline">Permissions</span>
          </Link>
          <Link href="/dashboard/roles">
            <span className="hover:underline">Manage Roles</span>
          </Link>
          <Link href="/dashboard/logs">
            <span className="hover:underline">Audit Logs</span>
          </Link>
          <Link href="/dashboard/profile">
            <span className="hover:underline">Profile</span>
          </Link>
        </nav>
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">{children}</main>
    </div>
  )
}



