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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Live Camera Feed */}
        <Card className="lg:col-span-2 overflow-hidden bg-black aspect-video flex items-center justify-center group relative border-none shadow-2xl">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase spacing-widest text-white/90">Live Camera Feed</span>
          </div>
          <img 
            src="http://localhost:5001/video_feed" 
            alt="Live Stream" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1200";
              (e.target as HTMLImageElement).className = "w-full h-full object-cover opacity-20 grayscale";
            }}
          />
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-[10px] text-white/80 font-mono border border-white/5">
            CAM_01_ENTRANCE_HD
          </div>
        </Card>

        {/* Live Detections Moved Here for better flow */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Live Detections</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDetections.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground border-dashed border-[1px] rounded-lg">
                No recent detections
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {recentDetections.map((detection, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border bg-card/50 p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`h-2 w-2 rounded-full ${detection.status === 'ALLOWED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                      <div>
                        <p className="text-sm font-bold font-mono tracking-tight">{detection.plate}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                          {detection.action || 'Check'} • {detection.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground opacity-60">
                      {new Date(detection.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Peak Hours Analytics</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Vehicle density and entry patterns by time of day</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <UsageChart data={stats} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
