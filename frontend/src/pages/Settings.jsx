import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import Sidebar from "../components/Sidebar"

export default function Settings() {
  const [settings, setSettings] = useState({
    enableMonitoring: true,
    enableCanary: true,
    autoStart: false,
    entropyThreshold: 7.0,
    threatThreshold: 80,
    filesThreshold: 200,
    autoKillSwitch: true,
    emailAlerts: false,
    email: "",
    watchDirs: "C:\\Users\\test\\Documents, C:\\Users\\test\\Desktop",
    canaryPerDir: 5,
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [settings])

  const handleSave = () => {
    setShowSaveSuccess(true)
    setHasUnsavedChanges(false)
    setTimeout(() => setShowSaveSuccess(false), 3000)
  }

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="min-h-screen bg-dark text-white flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-24 md:pb-10">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Settings</h1>
            <p className="text-white/60">Configure your RansomWatch preferences</p>
          </div>

          <div className="max-w-3xl space-y-6">
            {/* Monitoring Settings */}
            <div className="bg-white border border-dark text-dark rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Monitoring Settings</h2>
              <div className="space-y-4">
                <ToggleRow
                  label="Enable File Monitoring"
                  checked={settings.enableMonitoring}
                  onToggle={() => handleToggle("enableMonitoring")}
                />
                <ToggleRow
                  label="Enable Canary Files"
                  checked={settings.enableCanary}
                  onToggle={() => handleToggle("enableCanary")}
                />
                <ToggleRow
                  label="Auto-start on System Boot"
                  checked={settings.autoStart}
                  onToggle={() => handleToggle("autoStart")}
                />
                <div className="pt-2">
                  <label className="block font-semibold mb-2">
                    Directories to Watch
                  </label>
                  <textarea
                    value={settings.watchDirs}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        watchDirs: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-xl border border-dark/20 text-dark bg-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Canary Files per Directory
                  </label>
                  <input
                    type="number"
                    value={settings.canaryPerDir}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        canaryPerDir: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-3 rounded-xl border border-dark/20 text-dark"
                  />
                </div>
              </div>
            </div>

            {/* Alert Thresholds */}
            <div className="bg-dark border border-white/10 rounded-2xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Alert Thresholds</h2>
              <div className="space-y-6">
                <SliderRow
                  label="Entropy Alert Threshold"
                  value={settings.entropyThreshold}
                  min={0}
                  max={8}
                  step={0.1}
                  onChange={(val) =>
                    setSettings((prev) => ({
                      ...prev,
                      entropyThreshold: val,
                    }))
                  }
                />
                <SliderRow
                  label="Threat Score Alert Threshold"
                  value={settings.threatThreshold}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(val) =>
                    setSettings((prev) => ({
                      ...prev,
                      threatThreshold: val,
                    }))
                  }
                />
                <SliderRow
                  label="Files/Minute Alert Threshold"
                  value={settings.filesThreshold}
                  min={0}
                  max={1000}
                  step={10}
                  onChange={(val) =>
                    setSettings((prev) => ({
                      ...prev,
                      filesThreshold: val,
                    }))
                  }
                />
              </div>
            </div>

            {/* Network & Notifications */}
            <div className="bg-white border border-dark text-dark rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Network & Notifications</h2>
              <div className="space-y-4">
                <ToggleRow
                  label="Automatic Network Kill Switch"
                  checked={settings.autoKillSwitch}
                  onToggle={() => handleToggle("autoKillSwitch")}
                />
                <ToggleRow
                  label="Email Alerts"
                  checked={settings.emailAlerts}
                  onToggle={() => handleToggle("emailAlerts")}
                />
                <AnimatePresence>
                  {settings.emailAlerts && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2">
                        <label className="block font-semibold mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="w-full p-3 rounded-xl border border-dark/20 text-dark"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-dark border-2 border-danger rounded-2xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4 text-danger">Danger Zone</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-5 py-3 rounded-full font-semibold bg-white/10 border border-danger hover:bg-danger/20 transition-all">
                  Clear All Alerts
                </button>
                <button className="px-5 py-3 rounded-full font-semibold bg-danger hover:bg-danger/80 transition-all">
                  Reset All Settings
                </button>
              </div>
              <p className="text-white/50 text-sm mt-4">
                Warning: These actions are irreversible and will delete all your data.
              </p>
            </div>
          </div>

          <AnimatePresence>
            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-6 right-6 z-50"
              >
                <button
                  onClick={handleSave}
                  className="bg-accent text-dark px-8 py-4 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:bg-accent/90 transition-all"
                >
                  {showSaveSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved!
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function ToggleRow({ label, checked, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium">{label}</span>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-all relative transition-colors ${
          checked ? "bg-accent" : "bg-white/20"
        }`}
      >
        <motion.div
          animate={{ x: checked ? 26 : 2 }}
          className="absolute top-1 w-4 h-4 bg-dark rounded-full"
        />
      </button>
    </div>
  )
}

function SliderRow({ label, value, min, max, step, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{label}</span>
        <span className="text-accent font-bold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
      />
    </div>
  )
}
