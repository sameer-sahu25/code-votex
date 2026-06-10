import { motion } from "framer-motion"

export default function ThreatMeter({ score }) {
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = () => {
    if (score < 30) return "#4DFF91"
    if (score < 70) return "#FFD84D"
    return "#FF4D4D"
  }

  const getStatus = () => {
    if (score < 30) return "SAFE"
    if (score < 70) return "SUSPICIOUS"
    return "CRITICAL"
  }

  const statusColor = score < 30 ? "bg-safe" : score < 70 ? "bg-warning" : "bg-danger"
  const statusTextColor = score < 70 ? "text-dark" : "text-white"

  return (
    <div className="bg-dark border border-white/10 rounded-2xl p-6 flex flex-col items-center">
      <h3 className="text-white font-semibold mb-6 text-lg">Live Threat Score</h3>
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="104"
            cy="104"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            fill="none"
          />
          <motion.circle
            cx="104"
            cy="104"
            r={radius}
            stroke={getColor()}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: score / 100 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-white">{score}</span>
          <span className="text-white/50 text-sm">/100</span>
        </div>
      </div>
      <div className="mt-6">
        <motion.span
          className={`inline-block px-4 py-1.5 rounded-full font-semibold text-sm ${statusColor} ${statusTextColor}`}
          animate={score > 70 ? { scale: [1, 1.05, 1] } : {}}
          transition={score > 70 ? { duration: 1, repeat: Infinity } : {}}
        >
          {getStatus()}
        </motion.span>
      </div>
    </div>
  )
}
