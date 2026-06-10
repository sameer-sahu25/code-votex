import { motion } from "framer-motion"

export default function StatCard({ title, value, icon: Icon, trend, cardType = "dark" }) {
  const cardClasses = {
    dark: "bg-dark border border-white/10 text-white",
    white: "bg-white border border-dark text-dark",
    green: "bg-accent border border-dark text-dark",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className={`${cardClasses[cardType]} rounded-2xl p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium ${cardType === "white" ? "text-dark/70" : "text-white/60"}`}>
          {title}
        </h3>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-4xl font-bold">{value}</p>
        {trend && (
          <span className={`text-sm font-medium ${trend.positive ? "text-safe" : "text-danger"}`}>
            {trend.value}
          </span>
        )}
      </div>
    </motion.div>
  )
}
