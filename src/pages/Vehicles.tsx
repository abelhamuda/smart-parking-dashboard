import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Badge } from "../components/ui/Badge"
import { vehicleService } from "../services/api"
import type { Vehicle } from "../types"
import { useSocket } from "../hooks/useSocket"

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [plate, setPlate] = useState("")
  const [type, setType] = useState("Car")

  const fetchVehicles = () => {
    vehicleService.getVehicles().then(setVehicles).catch(console.error)
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  useSocket('vehicle_update', () => {
    // When a vehicle is added, updated, deleted, or toggled
    fetchVehicles()
  })

  useSocket('plate_detected', () => {
    // No need to fetch, unless we show activity. We leave this empty.
  })

  const register = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plate) return
    try {
      await vehicleService.registerVehicle(plate, type)
      setPlate("")
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error registering vehicle')
    }
  }

  const toggle = async (id: number) => {
    try {
      await vehicleService.toggleVehicle(id)
    } catch (err) {
      console.error(err)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return
    try {
      await vehicleService.deleteVehicle(id)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="animate-slide-up space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Management</h1>
        <p className="text-muted-foreground mt-1">Manage registered vehicles and permissions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register New Vehicle</CardTitle>
          <CardDescription>Add a new license plate to the allowed registry.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={register} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium leading-none">License Plate</label>
              <Input
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="e.g. B 1234 CD"
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium leading-none">Vehicle Type</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="VIP">VIP</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
            <Button type="submit">Register</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered Vehicles</CardTitle>
          <CardDescription>Total {vehicles.length} vehicles registered.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.plate_number}</TableCell>
                    <TableCell>{v.vehicle_type}</TableCell>
                    <TableCell>{new Date(v.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={v.is_active ? 'active' : 'inactive'}>
                        {v.is_active ? 'Active' : 'Blocked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => toggle(v.id)}>
                        {v.is_active ? 'Block' : 'Unblock'}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => remove(v.id)}>
                        Delete
                      </Button>
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
