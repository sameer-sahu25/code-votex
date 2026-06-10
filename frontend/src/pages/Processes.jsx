import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Cpu, Activity } from "lucide-react"
import Sidebar from "../components/Sidebar"
import ProcessTable from "../components/ProcessTable"
import StatCard from "../components/StatCard"
import { mockProcesses } from "../data/mockData"

export default function Processes() {
  const [searchQuery, setSearchQuery] = useState("")

  const sortedProcesses = useMemo(() => {
    return [...mockProcesses]
      .sort((a, b) => b.threatScore - a.threatScore)
      .filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [searchQuery])

  const topSuspicious = sortedProcesses.filter(
    (p) => p.status !== "safe"
  )

  return (
    <div className="min-h-screen bg-dark text-white flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-24 md:pb-10">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Process Monitor</h1>
            <p className="text-white/60">All running processes and their threat scores</p>
          </div>

          {/* Top Suspicious Processes */}
          {topSuspicious.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-danger" />
                Top Suspicious Processes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topSuspicious.map((process, index) => (
                  <motion.div
                    key={process.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-2xl p-6 border ${
                      process.status === "critical"
                        ? "bg-danger/10 border-danger"
                        : "bg-warning/10 border-warning"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-dark flex items-center justify-center">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate">{process.name}</h3>
                        <p className="text-white/50 text-sm">PID: {process.pid}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Threat Score</span>
                        <span className="font-semibold">{process.threatScore}/100</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            process.status === "critical"
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                          style={{ width: `${process.threatScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Files/Min</span>
                        <span>{process.filesPerMin}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Renames</span>
                        <span>{process.renameRate}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search processes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Process Table */}
          <ProcessTable processes={sortedProcesses} />
        </div>
      </main>
    </div>
  )
}
