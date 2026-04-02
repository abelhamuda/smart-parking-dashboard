import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { hardwareService } from "../services/api"
import { useSocket } from "../hooks/useSocket"
import { 
  Cpu, Wifi, WifiOff, Radio, Volume2, Lightbulb, 
  Gauge, Play, CheckCircle2, XCircle, Loader2, RotateCw 
} from "lucide-react"

type TestStatus = 'idle' | 'testing' | 'success' | 'error'

interface ComponentState {
  status: TestStatus
  message: string
}

interface IoTStatus {
  connected: boolean
  serial_port: string | null
  serial_connected: boolean
  ultrasonic_distance: number | null
  last_heartbeat: string | null
}

const COMPONENTS = [
  { id: 'SERVO',      label: 'Servo Gate',       icon: RotateCw,  pin: 'GPIO 13', description: 'Opens gate for 3s then closes' },
  { id: 'BUZZER',     label: 'Buzzer',           icon: Volume2,   pin: 'GPIO 27', description: 'Beeps for configured duration' },
  { id: 'ULTRASONIC', label: 'Ultrasonic Sensor', icon: Gauge,    pin: 'GPIO 5/18', description: 'Reads current distance' },
  { id: 'LED_RED',    label: 'Red LED',          icon: Lightbulb, pin: 'GPIO 26', description: 'Toggles on for 3s' },
  { id: 'LED_GREEN',  label: 'Green LED',        icon: Lightbulb, pin: 'GPIO 25', description: 'Toggles on for 3s' },
  { id: 'LED_YELLOW', label: 'Yellow LED',       icon: Lightbulb, pin: 'GPIO 33', description: 'Toggles on for 3s' },
]

export default function Hardware() {
  const [iotStatus, setIoTStatus] = useState<IoTStatus>({
    connected: false,
    serial_port: null,
    serial_connected: false,
    ultrasonic_distance: null,
    last_heartbeat: null,
  })

  const [componentStates, setComponentStates] = useState<Record<string, ComponentState>>(
    Object.fromEntries(COMPONENTS.map(c => [c.id, { status: 'idle' as TestStatus, message: '' }]))
  )

  // Fetch initial status
  useEffect(() => {
    hardwareService.getStatus().then(setIoTStatus).catch(console.error)
  }, [])

  // Listen for real-time status updates
  useSocket<IoTStatus>('iot_status_update', (data) => {
    setIoTStatus(data)
  })

  // Listen for hardware test results
  useSocket<{ component: string; success: boolean; message: string }>('hardware_result', (data) => {
    setComponentStates(prev => ({
      ...prev,
      [data.component]: {
        status: data.success ? 'success' : 'error',
        message: data.message,
      }
    }))
  })

  const handleTest = async (componentId: string) => {
    setComponentStates(prev => ({
      ...prev,
      [componentId]: { status: 'testing', message: 'Sending command...' }
    }))

    try {
      await hardwareService.testComponent(componentId)
      // Result will come back via Socket.IO
    } catch (err: any) {
      setComponentStates(prev => ({
        ...prev,
        [componentId]: { 
          status: 'error', 
          message: err.response?.data?.message || 'Failed to send command' 
        }
      }))
    }
  }

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'testing': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <div className="h-4 w-4 rounded-full border-2 border-dashed border-gray-300" />
    }
  }

  const getLedColor = (id: string) => {
    if (id === 'LED_RED') return 'text-red-500'
    if (id === 'LED_GREEN') return 'text-emerald-500'
    if (id === 'LED_YELLOW') return 'text-amber-500'
    return 'text-muted-foreground'
  }

  return (
    <div className="animate-slide-up space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hardware Diagnostics</h1>
        <p className="text-muted-foreground mt-1">
          Test and calibrate individual hardware components.
        </p>
      </div>

      {/* Connection Status Banner */}
      <Card className={`border-l-4 ${iotStatus.connected ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {iotStatus.connected ? (
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Wifi className="h-5 w-5 text-emerald-500" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <WifiOff className="h-5 w-5 text-red-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold">
                  {iotStatus.connected ? 'IoT System Online' : 'IoT System Offline'}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
                  {iotStatus.connected 
                    ? `${iotStatus.serial_port || 'N/A'} • Serial ${iotStatus.serial_connected ? 'Connected' : 'Disconnected'} • Last ping: ${iotStatus.last_heartbeat || 'N/A'}`
                    : 'Start main.py to connect the hardware controller'
                  }
                </p>
              </div>
            </div>

            {iotStatus.connected && iotStatus.ultrasonic_distance !== null && (
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-muted-foreground animate-pulse" />
                  <span className="text-2xl font-bold font-mono">
                    {iotStatus.ultrasonic_distance.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">cm</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Live Distance</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Component Test Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {COMPONENTS.map((comp) => {
          const state = componentStates[comp.id]
          const Icon = comp.icon
          const isLed = comp.id.startsWith('LED_')

          return (
            <Card key={comp.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center border
                    ${state.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : state.status === 'error' ? 'bg-red-500/10 border-red-500/30' 
                    : state.status === 'testing' ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-muted border-transparent'}`}>
                    <Icon className={`h-4 w-4 ${isLed ? getLedColor(comp.id) : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">{comp.label}</CardTitle>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{comp.pin}</p>
                  </div>
                </div>
                {getStatusIcon(state.status)}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">{comp.description}</p>
                
                {state.message && (
                  <div className={`text-[11px] p-2 rounded-md mb-3 font-mono
                    ${state.status === 'success' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                    : state.status === 'error' ? 'bg-red-500/10 text-red-700 dark:text-red-400' 
                    : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
                    {state.message}
                  </div>
                )}

                <button
                  onClick={() => handleTest(comp.id)}
                  disabled={state.status === 'testing' || !iotStatus.connected}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium 
                    hover:bg-accent hover:text-accent-foreground transition-colors
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {state.status === 'testing' ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Run Test
                    </>
                  )}
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pin Reference */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">ESP32 Pin Reference</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { pin: 'GPIO 27', label: 'Buzzer', color: 'bg-orange-500/10 text-orange-700' },
              { pin: 'GPIO 13', label: 'Servo', color: 'bg-blue-500/10 text-blue-700' },
              { pin: 'GPIO 5',  label: 'Trig (US)', color: 'bg-violet-500/10 text-violet-700' },
              { pin: 'GPIO 18', label: 'Echo (US)', color: 'bg-violet-500/10 text-violet-700' },
              { pin: 'GPIO 26', label: 'LED Red', color: 'bg-red-500/10 text-red-700' },
              { pin: 'GPIO 25', label: 'LED Green', color: 'bg-emerald-500/10 text-emerald-700' },
              { pin: 'GPIO 33', label: 'LED Yellow', color: 'bg-amber-500/10 text-amber-700' },
              { pin: 'GPIO 21/22', label: 'LCD (I2C)', color: 'bg-gray-500/10 text-gray-700' },
            ].map((item) => (
              <div key={item.pin} className={`rounded-lg px-3 py-2 ${item.color}`}>
                <p className="text-[10px] font-bold uppercase tracking-wide">{item.label}</p>
                <p className="text-xs font-mono font-bold mt-0.5">{item.pin}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
