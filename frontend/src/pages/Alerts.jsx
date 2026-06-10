import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, CheckCircle, Bell } from "lucide-react"
import Sidebar from "../components/Sidebar"
import AlertCard from "../components/AlertCard"
import { mockAlerts } from "../data/mockData"

const FILTERS = ["all", "critical", "warning", "info"]

export default function Alerts() {
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter((alert) => {
      const matchesFilter = filter === "all" || alert.type === filter
      const matchesSearch =
        searchQuery === "" ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.processName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [filter, searchQuery])

  const alertCounts = useMemo(() => {
    return mockAlerts.reduce(
      (acc, alert) => {
        acc[alert.type]++
        acc.all++
        return acc
      },
      { all: 0, critical: 0, warning: 0, info: 0 }
    )
  }, [])

  return (
    <div className="min-h-screen bg-dark text-white flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-24 md:pb-10">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Alerts</h1>
            <p className="text-white/60">All threats and suspicious activity detected</p>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center">
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full font-semibold capitalize transition-all ${
                    filter === f
                      ? "bg-accent text-dark"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {f} ({alertCounts[f]})
                </button>
              ))}
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Alerts List */}
          {filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AlertCard alert={alert} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CheckCircle className="w-20 h-20 text-safe mb-4" />
              <h3 className="text-2xl font-bold mb-2">No alerts found</h3>
              <p className="text-white/60 max-w-md">
                {searchQuery
                  ? "Try adjusting your search or filter."
                  : "Great job! Your system is currently safe."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
