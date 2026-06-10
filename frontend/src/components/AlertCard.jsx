import { motion } from "framer-motion"
import { Circle } from "lucide-react"

export default function AlertCard({ alert }) {
  const getLeftBorder = () => {
    if (alert.type === "critical") return "border-l-4 border-l-danger"
    if (alert.type === "warning") return "border-l-4 border-l-warning"
    return "border-l-4 border-l-blue-500"
  }

  const getTypeBadge = () => {
    const colors = {
      critical: "bg-danger text-white",
      warning: "bg-warning text-dark",
      info: "bg-blue-500 text-white",
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${colors[alert.type]}`}>
        {alert.type}
      </span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white border border-dark rounded-2xl p-6 ${getLeftBorder()}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {getTypeBadge()}
          <span className="text-dark/50 text-sm">{new Date(alert.timestamp).toLocaleString()}</span>
        </div>
        {alert.type === "critical" && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Circle className="w-3 h-3 fill-danger text-danger" />
          </motion.div>
        )}
      </div>
      <h4 className="text-dark font-semibold text-lg mb-2">{alert.message}</h4>
      <div className="space-y-1">
        <p className="text-dark/70 text-sm">
          <span className="font-medium">Process:</span> {alert.processName} (PID: {alert.processPid})
        </p>
        {alert.filePath && (
          <p className="text-dark/70 text-sm">
            <span className="font-medium">File:</span> {alert.filePath}
          </p>
        )}
        <div className="flex gap-4 mt-2">
          {alert.entropyScore && (
            <span className="text-dark/60 text-sm">Entropy: {alert.entropyScore}</span>
          )}
          {alert.threatScore && (
            <span className="text-dark/60 text-sm">Threat Score: {alert.threatScore}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
