import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  Lock,
  Activity,
  Zap,
  WifiOff,
  LayoutDashboard,
  ChevronDown,
  ArrowRight,
  Cpu,
} from "lucide-react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Terminal from "../components/Terminal"

const features = [
  {
    icon: Lock,
    title: "Canary File System",
    description: "Place decoy files to trap ransomware instantly.",
    cardType: "dark",
  },
  {
    icon: Activity,
    title: "Entropy Analyzer",
    description: "Detect file encryption in real time.",
    cardType: "white",
  },
  {
    icon: Cpu,
    title: "Process Monitor",
    description: "Track every process touching your files.",
    cardType: "green",
  },
  {
    icon: Zap,
    title: "AI Threat Score",
    description: "0-100 live risk scoring per process.",
    cardType: "dark",
  },
  {
    icon: WifiOff,
    title: "Network Kill Switch",
    description: "Auto disconnect on confirmed attack.",
    cardType: "white",
  },
  {
    icon: LayoutDashboard,
    title: "Live Dashboard",
    description: "Full log of every suspicious event.",
    cardType: "green",
  },
]

const howItWorksSteps = [
  {
    step: "01",
    title: "Monitoring Starts",
    description: "RansomWatch begins watching your file system in real time.",
  },
  {
    step: "02",
    title: "Files Watched",
    description: "Every file modification and process access is tracked.",
  },
  {
    step: "03",
    title: "Entropy Calculated",
    description: "We analyze file randomness to detect encryption.",
  },
  {
    step: "04",
    title: "Threat Score Updated",
    description: "The AI calculates risk based on multiple signals.",
  },
  {
    step: "05",
    title: "Alert Fired",
    description: "Instant alerts for suspicious activity.",
  },
  {
    step: "06",
    title: "Network Isolated",
    description: "Automatic kill switch to stop attacks.",
  },
]

export default function Landing() {
  const [expandedStep, setExpandedStep] = useState(null)

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-accent text-dark text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Cybersecurity Tool
              </span>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Stop Ransomware
                <br />
                <span className="text-accent">Before It Starts</span>
              </h1>
              <p className="text-white/70 text-lg mb-8 max-w-md">
                Real-time file monitoring, entropy detection, and automatic network isolation to protect your system from ransomware attacks.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 bg-white text-dark px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-all"
                >
                  Start Monitoring
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/5 transition-all"
                >
                  See How It Works
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -top-4 -right-4 bg-accent text-dark px-4 py-2 rounded-full text-sm font-semibold">
                Live Demo
              </div>
              <Terminal />
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Files Monitored"
              value="4,821"
              cardType="dark"
              delay={0}
            />
            <StatCard
              title="Detection Speed"
              value="0.3s"
              cardType="white"
              delay={0.1}
            />
            <StatCard
              title="Attacks Stopped"
              value="3"
              cardType="green"
              delay={0.2}
            />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mb-20">
          <div className="text-center mb-12">
            <span className="inline-block bg-accent text-dark text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Features
            </span>
            <h2 className="text-4xl font-bold">Everything you need to stay protected</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} delay={index * 0.1} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mb-20">
          <div className="text-center mb-12">
            <span className="inline-block bg-accent text-dark text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Process
            </span>
            <h2 className="text-4xl font-bold">How RansomWatch works</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {howItWorksSteps.map((step, index) => (
              <AccordionItem
                key={index}
                step={step}
                isExpanded={expandedStep === index}
                onClick={() => setExpandedStep(expandedStep === index ? null : index)}
              />
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mb-20">
          <div className="bg-accent rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold text-dark mb-6">
              Ready to protect your system?
            </h2>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-dark text-white px-8 py-4 rounded-full font-semibold hover:bg-dark/90 transition-all"
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold">RansomWatch</span>
          </div>
          <div className="flex gap-8 text-white/60">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
          <p className="text-white/40 text-sm">
            © 2025 RansomWatch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ title, value, cardType, delay }) {
  const cardClasses = {
    dark: "bg-dark border border-white/10 text-white",
    white: "bg-white border border-dark text-dark",
    green: "bg-accent border border-dark text-dark",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${cardClasses[cardType]} rounded-2xl p-8 text-center`}
    >
      <p
        className={`text-sm font-medium mb-2 ${
          cardType === "white" ? "text-dark/60" : "text-white/60"
        }`}
      >
        {title}
      </p>
      <p className="text-5xl font-bold">{value}</p>
    </motion.div>
  )
}

function FeatureCard({ feature, delay }) {
  const cardClasses = {
    dark: "bg-dark border border-white/10 text-white",
    white: "bg-white border border-dark text-dark",
    green: "bg-accent border border-dark text-dark",
  }
  const Icon = feature.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className={`${cardClasses[feature.cardType]} rounded-2xl p-6`}
    >
      <Icon
        className={`w-10 h-10 mb-4 ${
          feature.cardType === "green" ? "text-dark" : "text-accent"
        }`}
      />
      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
      <p
        className={`text-sm mb-4 ${
          feature.cardType === "white" ? "text-dark/70" : "text-white/70"
        }`}
      >
        {feature.description}
      </p>
      <span
        className={`inline-flex items-center gap-1 text-sm font-semibold ${
          feature.cardType === "green" ? "text-dark" : "text-accent"
        }`}
      >
        Learn more
        <ArrowRight className="w-4 h-4" />
      </span>
    </motion.div>
  )
}

function AccordionItem({ step, isExpanded, onClick }) {
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden ${
        isExpanded ? "bg-accent" : "bg-dark border border-white/10"
      }`}
      initial={false}
      animate={{
        backgroundColor: isExpanded ? "#B5FF4D" : "#191A23",
      }}
    >
      <button
        onClick={onClick}
        className="w-full p-6 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <span
            className={`text-2xl font-bold ${
              isExpanded ? "text-dark" : "text-accent"
            }`}
          >
            {step.step}
          </span>
          <h3
            className={`text-xl font-semibold ${
              isExpanded ? "text-dark" : "text-white"
            }`}
          >
            {step.title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown
            className={`w-6 h-6 ${
              isExpanded ? "text-dark" : "text-white/60"
            }`}
          />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <p className="text-dark/80">{step.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
