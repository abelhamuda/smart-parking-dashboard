import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { capacityService, gateService } from "../services/api"
import type { Capacity } from "../types"
import { Lock, Unlock } from "lucide-react"
import { useSocket } from "../hooks/useSocket"

export default function Settings() {
  const [capacity, setCapacity] = useState<Capacity | null>(null)
  const [total, setTotal] = useState<number>(20)
  const [occupied, setOccupied] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  const fetchCapacity = () => {
    capacityService.getCapacity().then((cap) => {
      setCapacity(cap)
      setTotal(cap.total_slots)
      setOccupied(cap.occupied_slots)
    }).catch(console.error)
  }

  useEffect(() => {
    fetchCapacity()
  }, [])

  useSocket<Capacity>('capacity_update', (data) => {
    setCapacity(data)
    setTotal(data.total_slots)
    setOccupied(data.occupied_slots)
  })

  // Gate Controls
  const triggerGate = async (action: 'OPEN' | 'CLOSE') => {
    try {
      if (action === 'OPEN') await gateService.openGate()
      if (action === 'CLOSE') await gateService.closeGate()
    } catch (err) {
      console.error(err)
    }
  }

  // Capacity update
  const handleSaveCapacity = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await capacityService.updateCapacity(total, occupied)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-slide-up space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Controls</h1>
        <p className="text-muted-foreground mt-1">Manage gates and modify parking capacity parameters.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Manual Gate Control</CardTitle>
            <CardDescription>Force the security barrier to open or close.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button 
              className="w-full flex items-center justify-center gap-2 h-14" 
              onClick={() => triggerGate('OPEN')}
            >
              <Unlock className="h-5 w-5" />
              Open Gate
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 h-14" 
              onClick={() => triggerGate('CLOSE')}
            >
              <Lock className="h-5 w-5" />
              Close Gate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacity Overrides</CardTitle>
            <CardDescription>Adjust total bounds and current occupancy.</CardDescription>
          </CardHeader>
          <CardContent>
            {capacity && (
              <form onSubmit={handleSaveCapacity} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Total Slots</label>
                  <Input 
                    type="number" 
                    value={total} 
                    onChange={(e) => setTotal(parseInt(e.target.value) || 0)} 
                    required 
                    min={0}
                  />
                  <p className="text-[10px] text-muted-foreground">The maximum number of vehicles allowed inside.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Occupied Slots</label>
                  <Input 
                    type="number" 
                    value={occupied} 
                    onChange={(e) => setOccupied(parseInt(e.target.value) || 0)} 
                    required 
                    min={0}
                  />
                  <p className="text-[10px] text-muted-foreground">Current count. Useful if sensors fall out of sync.</p>
                </div>
                
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
