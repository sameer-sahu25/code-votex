import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff } from "lucide-react"

export default function NetworkStatus({ isConnected, onToggle }) {
  return (
    <div className="bg-white border border-dark rounded-2xl p-6">
      <h3 className="text-dark font-semibold mb-6 text-lg">Network Status</h3>
      <AnimatePresence mode="wait">
        {isConnected ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center"
          >
            <Wifi className="w-16 h-16 text-safe mb-4" />
            <span className="text-2xl font-bold text-dark mb-6">Connected</span>
            <button
              onClick={onToggle}
              className="bg-danger text-white px-6 py-3 rounded-full font-semibold hover:bg-danger/90 transition-colors"
            >
              Isolate Network
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="isolated"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <WifiOff className="w-16 h-16 text-danger mb-4" />
            </motion.div>
            <span className="text-2xl font-bold text-danger mb-6">ISOLATED</span>
            <button
              onClick={onToggle}
              className="bg-safe text-dark px-6 py-3 rounded-full font-semibold hover:bg-safe/90 transition-colors"
            >
              Restore Network
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
