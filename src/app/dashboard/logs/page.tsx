'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface LogEntry {
  id: string
  action: string
  entity: string
  entity_id: string
  details: unknown   
  performed_by: string | null
  created_at: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) setLogs(data)
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-black">Audit Logs</h1>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <p className="text-gray-500">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500">No logs found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="capitalize">{log.action}</TableCell>
                    <TableCell>{log.entity}</TableCell>
                    <TableCell>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 max-w-md overflow-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </TableCell>
                    <TableCell>{log.performed_by ?? 'System'}</TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

