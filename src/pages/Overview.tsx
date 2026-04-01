import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { useSocket } from "../hooks/useSocket"
import { capacityService, vehicleService, logService } from "../services/api"
import type { Capacity, AlertNotification } from "../types"
import { Activity, Car, BarChart3, CheckCircle2 } from "lucide-react"
import { UsageChart } from "../components/UsageChart"

export default function Overview() {
  const [capacity, setCapacity] = useState<Capacity>({ id: 1, total_slots: 20, occupied_slots: 0 })
  const [recentDetections, setRecentDetections] = useState<AlertNotification[]>([])
  const [totalVehicles, setTotalVehicles] = useState<number>(0)
  const [stats, setStats] = useState<{ hour: string; count: number }[]>([])

  useEffect(() => {
    capacityService.getCapacity().then(setCapacity).catch(console.error)
    vehicleService.getVehicles().then(v => setTotalVehicles(v.length)).catch(console.error)
    logService.getStats().then(setStats).catch(console.error)

    // Pre-populate recent detections with history
    logService.getLogs().then(logs => {
      const formatted = logs.slice(0, 10).map((log: any) => ({
        plate: log.plate_number,
        status: log.status,
        message: log.status === 'ALLOWED' ? `${log.action} Granted` : 'Access Denied',
        timestamp: log.timestamp,
        action: log.action
      }))
      setRecentDetections(formatted)
    }).catch(console.error)
  }, [])

  useSocket<Capacity>('capacity_update', (data) => {
    setCapacity(data)
  })

  useSocket('vehicle_update', () => {
    vehicleService.getVehicles().then(v => setTotalVehicles(v.length)).catch(console.error)
  })

  useSocket<AlertNotification>('plate_detected', (data) => {
    setRecentDetections((prev) => [data, ...prev].slice(0, 10)) // Keep last 10
    // Refresh stats if allowed
    if (data.status === 'ALLOWED') {
      logService.getStats().then(setStats).catch(console.error)
    }
  })

  const availableSlots = Math.max(0, capacity.total_slots - capacity.occupied_slots)
  const utilization = capacity.total_slots > 0 ? (capacity.occupied_slots / capacity.total_slots) * 100 : 0

  return (
    <div className="animate-slide-up space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">
          Real-time metrics and live feed for your smart parking facility.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capacity.total_slots}</div>
            <p className="text-xs text-muted-foreground">Registered slots</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capacity.occupied_slots}</div>
            <p className="text-xs text-muted-foreground mb-2">
              {Math.round(utilization)}% utilization
            </p>
            <div className="h-1.5 w-full bg-secondary overflow-hidden rounded-full">
               <div 
                 className="h-full bg-primary transition-all duration-500 ease-in-out" 
                 style={{ width: `${Math.min(100, utilization)}%` }} 
               />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableSlots}</div>
            <p className="text-xs text-muted-foreground">Open spaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Known plates</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Peak Hours</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Vehicle density by time of day</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <UsageChart data={stats} />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Live Detections</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDetections.length === 0 ? (
              <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground border-dashed border-[1px] rounded-lg">
                No recent detections
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {recentDetections.map((detection, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-3">
                      {detection.status === 'ALLOWED' ? (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium leading-none">{detection.plate}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {detection.action ? `${detection.action} - ` : ''}{detection.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(detection.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
