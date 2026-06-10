import { motion } from "framer-motion"
import { CheckCircle, XCircle } from "lucide-react"

export default function CanaryStatus({ canaryFiles }) {
  const hasTouched = canaryFiles.some((file) => file.status === "touched")

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 ${
        hasTouched
          ? "bg-dark border-2 border-danger shadow-[0_0_20px_rgba(255,77,77,0.3)]"
          : "bg-dark border border-white/10"
      }`}
    >
      <h3 className="text-white font-semibold mb-4 text-lg">Canary Files</h3>
      <div className="space-y-3 mb-6">
        {canaryFiles.map((file, index) => (
          <motion.div
            key={file.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
          >
            <div className="flex items-center gap-3">
              {file.status === "safe" ? (
                <CheckCircle className="w-5 h-5 text-safe" />
              ) : (
                <XCircle className="w-5 h-5 text-danger" />
              )}
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{file.filePath.split("\\").pop()}</p>
                <p className="text-white/50 text-sm truncate">{file.directory}</p>
              </div>
            </div>
            {file.status === "touched" && (
              <div className="text-right">
                <p className="text-danger text-sm font-medium">{file.touchedBy}</p>
                <p className="text-white/50 text-xs">{new Date(file.touchedAt).toLocaleTimeString()}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-center">
        {hasTouched ? (
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-block px-4 py-2 bg-danger text-white rounded-full font-semibold"
          >
            ATTACK DETECTED
          </motion.span>
        ) : (
          <span className="inline-block px-4 py-2 bg-safe text-dark rounded-full font-semibold">
            All traps intact
          </span>
        )}
      </div>
    </div>
  )
}
