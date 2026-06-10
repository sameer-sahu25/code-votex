import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, LayoutDashboard, Bell, Cpu, Circle, Zap } from "lucide-react"
import Sidebar from "../components/Sidebar"
import StatCard from "../components/StatCard"
import ThreatMeter from "../components/ThreatMeter"
import FileEventFeed from "../components/FileEventFeed"
import CanaryStatus from "../components/CanaryStatus"
import NetworkStatus from "../components/NetworkStatus"
import ProcessTable from "../components/ProcessTable"
import {
  mockStats,
  mockProcesses,
  mockFileEvents,
  mockCanaryFiles,
} from "../data/mockData"

export default function Dashboard() {
  const [threatScore, setThreatScore] = useState(mockStats.threatScore)
  const [fileEvents, setFileEvents] = useState(mockFileEvents)
  const [isMonitoringActive, setIsMonitoringActive] = useState(true)
  const [networkConnected, setNetworkConnected] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setThreatScore((prev) => {
        const change = Math.floor(Math.random() * 11) - 5
        const newScore = Math.max(0, Math.min(100, prev + change))
        return newScore
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const fakeFiles = [
        "budget.xlsx",
        "report.pdf",
        "presentation.pptx",
        "notes.txt",
        "data.csv",
      ]
      const randomFile = fakeFiles[Math.floor(Math.random() * fakeFiles.length)]
      const randomEntropy = (Math.random() * 8).toFixed(1)
      const fakeEvent = {
        id: Date.now(),
        filePath: `C:/Users/test/documents/${randomFile}`,
        eventType: "modified",
        processName: Math.random() > 0.8 ? "suspicious.exe" : "system.exe",
        entropyAfter: parseFloat(randomEntropy),
        timestamp: new Date().toISOString(),
      }
      setFileEvents((prev) => [fakeEvent, ...prev].slice(0, 10))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-dark text-white flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-24 md:pb-10">
        <div className="p-6 md:p-8">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">Good morning 👋</h1>
              <p className="text-white/60">Your system is currently protected</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Circle
                    className={`w-3 h-3 fill-${
                      isMonitoringActive ? "safe" : "warning"
                    } text-${isMonitoringActive ? "safe" : "warning"}`}
                  />
                </motion.div>
                <span className="font-semibold">
                  {isMonitoringActive ? "Monitoring Active" : "Monitoring Paused"}
                </span>
              </div>
              <button
                onClick={() => setIsMonitoringActive(!isMonitoringActive)}
                className={`px-5 py-2 rounded-full font-semibold transition-all ${
                  isMonitoringActive
                    ? "bg-danger text-white hover:bg-danger/90"
                    : "bg-safe text-dark hover:bg-safe/90"
                }`}
              >
                {isMonitoringActive ? "Stop Monitoring" : "Start Monitoring"}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Files Monitored"
              value={mockStats.filesMonitored.toLocaleString()}
              icon={Shield}
              cardType="white"
            />
            <StatCard
              title="Threat Score"
              value={`${threatScore}/100`}
              icon={Zap}
              cardType="green"
            />
            <StatCard
              title="Active Processes"
              value={mockStats.activeProcesses}
              icon={Cpu}
              cardType="dark"
            />
            <StatCard
              title="Alerts Today"
              value={mockStats.alertsToday}
              icon={Bell}
              cardType="white"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <ThreatMeter score={threatScore} />
              <FileEventFeed events={fileEvents} />
            </div>
            <div className="space-y-6">
              <CanaryStatus canaryFiles={mockCanaryFiles} />
              <NetworkStatus
                isConnected={networkConnected}
                onToggle={() => setNetworkConnected(!networkConnected)}
              />
            </div>
          </div>

          {/* Process Table */}
          <div className="w-full">
            <ProcessTable processes={mockProcesses} />
          </div>
        </div>
      </main>
    </div>
  )
}
