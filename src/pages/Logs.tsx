import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { logService } from "../services/api"
import type { AccessLog } from "../types"
import { useSocket } from "../hooks/useSocket"

export default function Logs() {
  const [logs, setLogs] = useState<AccessLog[]>([])

  const fetchLogs = () => {
    logService.getLogs().then((res) => setLogs(res)).catch(console.error)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useSocket('plate_detected', () => {
    fetchLogs() // Re-fetch logs when new entry/exit is detected
  })

  return (
    <div className="animate-slide-up space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Access Logs</h1>
        <p className="text-muted-foreground mt-1">
          Historical record of all vehicle entries and exits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Showing recent access events.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Plate Number</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No logs available.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{log.plate_number}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'ALLOWED' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
