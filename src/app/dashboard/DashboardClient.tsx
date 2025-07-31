'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent } from '@/components/ui/card'

// Props for email display
interface Props {
  userEmail: string
}

// Supabase join result type
interface UserRoleWithJoin {
  role_id: string
  roles: {
    name: string
  } | null
}

export default function DashboardClient({ userEmail }: Props) {
  const [roleName, setRoleName] = useState<string>('viewer')
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role_id, roles(name)')
          .eq('user_id', user.id)
          .maybeSingle<UserRoleWithJoin>()

        if (error) {
          console.error('Error fetching user role:', error.message)
        }

        if (data?.roles?.name) {
          setRoleName(data.roles.name)
        }
      }
    }

    fetchUserRole()
  }, [])

  return (
    <main className="p-6 space-y-4 text-black">
      <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
      <p className="text-gray-700">
        You are logged in as <span className="font-semibold">{userEmail}</span> ({roleName})
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/roles">
          <Card><CardContent className="p-4">Manage Roles</CardContent></Card>
        </Link>
        <Link href="/dashboard/permissions">
          <Card><CardContent className="p-4">Manage Permissions</CardContent></Card>
        </Link>
        <Link href="/dashboard/user-roles">
          <Card><CardContent className="p-4">Assign Roles</CardContent></Card>
        </Link>
        <Link href="/dashboard/profile">
          <Card><CardContent className="p-4">Profile Settings</CardContent></Card>
        </Link>
        <Link href="/dashboard/logs">
          <Card><CardContent className="p-4">Audit Logs</CardContent></Card>
        </Link>

        {roleName === 'admin' && (
          <Card>
            <CardContent className="p-4 text-red-600 font-semibold">
              Admin Panel Access: You can purge inactive users or manage system settings.
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}




