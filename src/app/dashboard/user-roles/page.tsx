'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Card, CardContent, Button, Label, Checkbox,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
}

interface Role {
  id: string
  name: string
}

export default function UserRolesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [assignedRoles, setAssignedRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  useEffect(() => {
    if (selectedUserId) fetchUserRoles(selectedUserId)
  }, [selectedUserId])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users_view')
      .select('id, email')
    if (error) toast.error('Failed to fetch users')
    else setUsers(data || [])
  }

  const fetchRoles = async () => {
    const { data, error } = await supabase.from('roles').select('*')
    if (error) toast.error('Failed to fetch roles')
    else setRoles(data || [])
  }

  const fetchUserRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
    if (error) toast.error('Failed to fetch assigned roles')
    else setAssignedRoles(data.map((r) => r.role_id))
  }

  const toggleRole = (roleId: string) => {
    setAssignedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    )
  }

  const saveRoles = async () => {
    if (!selectedUserId) return toast.warning('Please select a user')
    setLoading(true)

    const {
      data: { session }
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    // Step 1: Delete existing roles
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', selectedUserId)

    if (deleteError) {
      toast.error('Failed to reset roles')
      return setLoading(false)
    }

    // Step 2: Insert new roles
    const inserts = assignedRoles.map((role_id) => ({
      user_id: selectedUserId,
      role_id
    }))

    if (inserts.length) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(inserts)

      if (insertError) {
        toast.error('Failed to assign roles')
        return setLoading(false)
      }
    }

    // Step 3: Audit log
    await supabase.from('audit_logs').insert({
      action: 'update',
      entity: 'user_roles',
      entity_id: selectedUserId,
      details: { roles: assignedRoles },
      performed_by: userId
    })

    toast.success('Roles updated successfully')
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Assign Roles to Users</h1>

      <Card>
        <CardContent className="space-y-4 p-4">
          <Label>Select User</Label>
          <Select
            onValueChange={(value) => setSelectedUserId(value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUserId && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="text-lg font-semibold">Assign Roles</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <Checkbox
                    id={role.id}
                    checked={assignedRoles.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <Label htmlFor={role.id}>{role.name}</Label>
                </div>
              ))}
            </div>

            <Button onClick={saveRoles} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


