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

interface Role {
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) toast.error('Failed to fetch roles.')
    else if (data) setRoles(data)
  }

  const handleSubmit = async () => {
    if (!name.trim()) return toast.warning('Please enter a role name.')
    setLoading(true)

    const {
      data: { session }
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    if (editId) {
      // Update role
      const { error } = await supabase
        .from('roles')
        .update({ name, description })
        .eq('id', editId)

      if (!error) {
        toast.success('Role updated')

        await supabase.from('audit_logs').insert({
          action: 'update',
          entity: 'role',
          entity_id: editId,
          details: { name, description },
          performed_by: userId
        })
      }

      setEditId(null)
    } else {
      const newId = uuidv4()
      const { error } = await supabase
        .from('roles')
        .insert({ id: newId, name, description })

      if (!error) {
        toast.success('Role created')

        await supabase.from('audit_logs').insert({
          action: 'create',
          entity: 'role',
          entity_id: newId,
          details: { name, description },
          performed_by: userId
        })
      }
    }

    setName('')
    setDescription('')
    fetchRoles()
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const {
      data: { session }
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const { error } = await supabase.from('roles').delete().eq('id', id)

    if (!error) {
      toast.success('Role deleted')
      await supabase.from('audit_logs').insert({
        action: 'delete',
        entity: 'role',
        entity_id: id,
        performed_by: userId
      })
      fetchRoles()
    } else {
      toast.error(`Failed to delete role: ${error.message}`)
    }
  }

  const handleEdit = (role: Role) => {
    setEditId(role.id)
    setName(role.name)
    setDescription(role.description ?? '')
  }

  const cancelEdit = () => {
    setEditId(null)
    setName('')
    setDescription('')
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Roles</h1>

      <Card>
        <CardContent className="space-y-4 p-4">
          <Input
            placeholder="Role name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={loading}>
              {editId ? 'Update Role' : 'Create Role'}
            </Button>
            {editId && (
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>{new Date(role.created_at).toLocaleString()}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(role)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(role.id)}>Delete</Button>
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


