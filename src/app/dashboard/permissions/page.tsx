'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Card,
  CardContent,
  Input,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from '@/components/ui'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'

interface Permission {
  id: string
  name: string
  description: string | null
  created_at?: string
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) toast.error('Failed to fetch permissions.')
    if (data) setPermissions(data)
  }

  const handleSubmit = async () => {
    if (!name.trim()) return toast.warning('Please enter a name.')
    setLoading(true)

    const {
      data: { session }
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    if (editingId) {
      const { error } = await supabase
        .from('permissions')
        .update({ name, description })
        .eq('id', editingId)

      if (!error) {
        toast.success('Permission updated.')

        await supabase.from('audit_logs').insert({
          action: 'update',
          entity: 'permission',
          entity_id: editingId,
          details: { name, description },
          performed_by: userId
        })
      }
    } else {
      const id = uuidv4()
      const { error } = await supabase
        .from('permissions')
        .insert({ id, name, description })

      if (!error) {
        toast.success('Permission created.')

        await supabase.from('audit_logs').insert({
          action: 'create',
          entity: 'permission',
          entity_id: id,
          details: { name, description },
          performed_by: userId
        })
      }
    }

    setName('')
    setDescription('')
    setEditingId(null)
    setLoading(false)
    fetchPermissions()
  }

  const handleDelete = async (id: string) => {
    const {
      data: { session }
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const { error } = await supabase.from('permissions').delete().eq('id', id)

    if (!error) {
      toast.success('Permission deleted.')

      await supabase.from('audit_logs').insert({
        action: 'delete',
        entity: 'permission',
        entity_id: id,
        details: {},
        performed_by: userId
      })

      fetchPermissions()
    } else {
      toast.error(`Failed to delete permission: ${error.message}`)
    }
  }

  const startEdit = (perm: Permission) => {
    setEditingId(perm.id)
    setName(perm.name)
    setDescription(perm.description ?? '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setDescription('')
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Permissions</h1>

      {/* Form */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <Input
            placeholder="Permission name (e.g., can_edit_users)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading}>
              {editingId
                ? loading
                  ? 'Updating...'
                  : 'Update Permission'
                : loading
                ? 'Adding...'
                : 'Add Permission'}
            </Button>
            {editingId && (
              <Button variant="ghost" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((perm) => (
                <TableRow key={perm.id}>
                  <TableCell>{perm.name}</TableCell>
                  <TableCell>{perm.description}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="secondary" onClick={() => startEdit(perm)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(perm.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}



