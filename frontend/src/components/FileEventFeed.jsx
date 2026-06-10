import { motion } from "framer-motion"
import { File, FileText, FileX } from "lucide-react"

export default function FileEventFeed({ events }) {
  const getEntropyBadge = (entropy) => {
    if (entropy > 7)
      return <span className="px-2 py-0.5 bg-danger text-white text-xs font-semibold rounded-full">HIGH</span>
    if (entropy > 5)
      return <span className="px-2 py-0.5 bg-warning text-dark text-xs font-semibold rounded-full">MED</span>
    return <span className="px-2 py-0.5 bg-safe text-dark text-xs font-semibold rounded-full">LOW</span>
  }

  const getFileIcon = (name) => {
    if (name.endsWith(".txt")) return <FileText className="w-5 h-5 text-accent" />
    if (name.endsWith(".docx")) return <FileText className="w-5 h-5 text-white/70" />
    if (name.endsWith(".xlsx")) return <File className="w-5 h-5 text-safe" />
    return <File className="w-5 h-5 text-white/60" />
  }

  return (
    <div className="bg-white border border-dark rounded-2xl p-6">
      <h3 className="text-dark font-semibold mb-4 text-lg">Recent File Events</h3>
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-dark/50">
          <FileX className="w-12 h-12 mb-3" />
          <p>No file events yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {events.map((event, index) => (
            <motion.div
              key={event.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-dark/5 rounded-xl"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(event.filePath)}
                <div className="min-w-0">
                  <p className="text-dark font-medium truncate">{event.filePath.split("\\").pop()}</p>
                  <p className="text-dark/50 text-sm">
                    {event.processName} • {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              {getEntropyBadge(event.entropyAfter)}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
