import { motion } from "framer-motion"
import { Cpu, Circle } from "lucide-react"

export default function ProcessTable({ processes }) {
  const sortedProcesses = [...processes].sort((a, b) => b.threatScore - a.threatScore)

  const getStatusBadge = (status) => {
    const colors = {
      safe: "bg-safe text-dark",
      suspicious: "bg-warning text-dark",
      critical: "bg-danger text-white",
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>{status.toUpperCase()}</span>
  }

  const getLeftBorder = (status) => {
    if (status === "critical") return "border-l-4 border-l-danger"
    if (status === "suspicious") return "border-l-4 border-l-warning"
    return "border-l-4 border-l-safe"
  }

  const getScoreColor = (score) => {
    if (score < 30) return "bg-safe"
    if (score < 70) return "bg-warning"
    return "bg-danger"
  }

  return (
    <div className="bg-dark border border-white/10 rounded-2xl p-6 overflow-hidden">
      <h3 className="text-white font-semibold mb-4 text-lg">Active Processes</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-white/50 text-sm border-b border-white/10">
              <th className="text-left py-3 px-4">Process</th>
              <th className="text-left py-3 px-4">PID</th>
              <th className="text-left py-3 px-4">Files/min</th>
              <th className="text-left py-3 px-4">Renames</th>
              <th className="text-left py-3 px-4">Threat Score</th>
              <th className="text-left py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedProcesses.map((process, index) => (
              <motion.tr
                key={process.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-b border-white/5 ${getLeftBorder(process.status)}`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-white/70" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{process.name}</span>
                      {process.status === "critical" && (
                        <motion.div
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Circle className="w-2 h-2 fill-danger text-danger" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-white/70">{process.pid}</td>
                <td className="py-4 px-4 text-white/70">{process.filesPerMin}</td>
                <td className="py-4 px-4 text-white/70">{process.renameRate}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${process.threatScore}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${getScoreColor(process.threatScore)}`}
                      />
                    </div>
                    <span className="text-white font-medium w-8">{process.threatScore}</span>
                  </div>
                </td>
                <td className="py-4 px-4">{getStatusBadge(process.status)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
