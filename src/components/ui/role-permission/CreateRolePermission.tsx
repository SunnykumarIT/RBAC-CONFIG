'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

export default function CreateRolePermissionForm() {
  const [roleName, setRoleName] = useState('')
  const [permissionName, setPermissionName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!roleName && !permissionName) {
      toast.warning('Please enter at least a role or permission name.')
      return
    }

    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    if (roleName) {
      const roleId = uuidv4()
      const { error } = await supabase
        .from('roles')
        .insert({ id: roleId, name: roleName })

      if (error) {
        toast.error(`Failed to create role: ${error.message}`)
      } else {
        toast.success('Role created')
        await supabase.from('audit_logs').insert({
          action: 'create',
          entity: 'role',
          entity_id: roleId,
          details: { name: roleName },
          performed_by: userId,
        })
        setRoleName('')
      }
    }

    if (permissionName) {
      const permId = uuidv4()
      const { error } = await supabase
        .from('permissions')
        .insert({ id: permId, name: permissionName })

      if (error) {
        toast.error(`Failed to create permission: ${error.message}`)
      } else {
        toast.success('Permission created')
        await supabase.from('audit_logs').insert({
          action: 'create',
          entity: 'permission',
          entity_id: permId,
          details: { name: permissionName },
          performed_by: userId,
        })
        setPermissionName('')
      }
    }

    setLoading(false)
  }

  return (
    <Card className="max-w-md">
      <CardContent className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">Create Role / Permission</h2>

        <div>
          <Label htmlFor="role">Role Name</Label>
          <Input
            id="role"
            placeholder="e.g., admin"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="permission">Permission Name</Label>
          <Input
            id="permission"
            placeholder="e.g., can_edit_users"
            value={permissionName}
            onChange={(e) => setPermissionName(e.target.value)}
          />
        </div>

        <Button onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </CardContent>
    </Card>
  )
}

