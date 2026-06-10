import { NavLink, useLocation } from "react-router-dom"
import { Shield, LayoutDashboard, Bell, Cpu, Settings } from "lucide-react"

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Alerts", path: "/alerts", icon: Bell },
    { name: "Processes", path: "/processes", icon: Cpu },
    { name: "Settings", path: "/settings", icon: Settings },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-dark border-r border-white/10 flex-col z-40">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold text-white">RansomWatch</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-2 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-accent text-dark font-semibold"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-dark font-bold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                John Doe
              </p>
              <p className="text-white/50 text-sm truncate">
                test@example.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark border-t border-white/10 z-40">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 transition-all ${
                  isActive ? "text-accent" : "text-white/50"
                }`
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  )
}
