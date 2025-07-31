'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import CreateRolePermission from '@/components/ui/role-permission/CreateRolePermission'

interface Role {
  id: string
  name: string
  description: string | null
}

interface Permission {
  id: string
  name: string
}

export default function RolePermissionPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [assigned, setAssigned] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  useEffect(() => {
    if (selectedRoleId) fetchRolePermissions(selectedRoleId)
  }, [selectedRoleId])

  const fetchRoles = async () => {
    const { data, error } = await supabase.from('roles').select('*')
    if (error) return toast.error('Failed to fetch roles.')
    if (data) setRoles(data)
  }

  const fetchPermissions = async () => {
    const { data, error } = await supabase.from('permissions').select('*')
    if (error) return toast.error('Failed to fetch permissions.')
    if (data) setPermissions(data)
  }

  const fetchRolePermissions = async (roleId: string) => {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', roleId)

    if (error) return toast.error('Failed to fetch role permissions.')
    if (data) setAssigned(data.map((d) => d.permission_id))
  }

  const togglePermission = (permissionId: string) => {
    setAssigned((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const savePermissions = async () => {
    if (!selectedRoleId) return
    setLoading(true)

    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', selectedRoleId)

    if (deleteError) {
      toast.error('Failed to reset permissions.')
      return setLoading(false)
    }

    const inserts = assigned.map((permission_id) => ({
      role_id: selectedRoleId,
      permission_id,
    }))

    if (inserts.length) {
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(inserts)

      if (insertError) {
        toast.error('Failed to assign permissions.')
        return setLoading(false)
      }
    }

    // Audit log
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const userId = session?.user?.id

    await supabase.from('audit_logs').insert({
      action: 'update',
      entity: 'role_permissions',
      entity_id: selectedRoleId,
      details: { permissions: assigned },
      performed_by: userId,
    })

    toast.success('Permissions saved successfully.')
    setLoading(false)
  }

  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Roles & Permissions</h1>

      <CreateRolePermission />

      <Card>
        <CardContent className="space-y-4 p-4">
          <Label>Select Role</Label>
          <Select onValueChange={(value) => setSelectedRoleId(value)} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRoleId && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Permissions</h2>
              {roles.find((r) => r.id === selectedRoleId)?.description && (
                <p className="text-sm text-gray-600">
                  {roles.find((r) => r.id === selectedRoleId)?.description}
                </p>
              )}
            </div>

            <Input
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredPermissions.map((perm) => (
                <div key={perm.id} className="flex items-center gap-2">
                  <Checkbox
                    id={perm.id}
                    checked={assigned.includes(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                  />
                  <Label htmlFor={perm.id}>{perm.name}</Label>
                </div>
              ))}
            </div>

            <Button onClick={savePermissions} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



