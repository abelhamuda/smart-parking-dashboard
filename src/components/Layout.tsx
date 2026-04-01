import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, CarFront, ScrollText, Settings, Menu, X, Info, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { useSocket } from "../hooks/useSocket"
import type { AlertNotification } from "../types"

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 4000);
  }

  useSocket<AlertNotification>('plate_detected', (data) => {
    const isAllowed = data.status === 'ALLOWED'
    addToast(`Plate ${data.plate} — ${data.status}`, isAllowed ? 'success' : 'error')
  })

  useSocket<{ action: string }>('gate_command', (data) => {
    addToast(`Gate command: ${data.action}`, 'info')
  })

  const navItems = [
    { label: "Overview", href: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Vehicles", href: "/vehicles", icon: <CarFront className="h-4 w-4" /> },
    { label: "Access Logs", href: "/logs", icon: <ScrollText className="h-4 w-4" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <div className="flex h-screen w-full bg-[#fcfcfc]">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className="flex items-center gap-3 rounded-md border bg-white px-4 py-3 shadow-md pointer-events-auto min-w-[250px] transition-all"
          >
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-gray-500" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-gray-900" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-gray-400" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black text-white">
              <span className="text-xs font-bold">P</span>
            </div>
            Smart Parking
          </div>
          <button
            className="ml-auto p-2 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-black text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-6 md:px-8">
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full border bg-muted" />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
