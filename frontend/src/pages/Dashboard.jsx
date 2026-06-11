import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, LayoutDashboard, Bell, Cpu, Circle, Zap, Upload, FileQuestion, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
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

// 计算文件熵值的函数
function calculateEntropy(data) {
  const freq = {}
  for (let i = 0; i < data.length; i++) {
    const byte = data[i]
    freq[byte] = (freq[byte] || 0) + 1
  }
  
  let entropy = 0
  const len = data.length
  for (const byte in freq) {
    const prob = freq[byte] / len
    entropy -= prob * Math.log2(prob)
  }
  return entropy
}

export default function Dashboard() {
  const [threatScore, setThreatScore] = useState(mockStats.threatScore)
  const [fileEvents, setFileEvents] = useState(mockFileEvents)
  const [isMonitoringActive, setIsMonitoringActive] = useState(true)
  const [networkConnected, setNetworkConnected] = useState(true)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileResult, setFileResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragOver, setDragOver] = useState(false)

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

  // 处理文件上传
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      analyzeFile(file)
    }
  }

  // 处理拖放
  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      analyzeFile(file)
    }
  }

  // 分析文件
  const analyzeFile = (file) => {
    setUploadedFile(file)
    setIsAnalyzing(true)
    setFileResult(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target.result
      const data = new Uint8Array(arrayBuffer)
      const entropy = calculateEntropy(data)
      
      // 计算风险等级
      let riskLevel = "low"
      let riskScore = 0
      let riskMessage = "File appears normal"

      if (entropy > 7.5) {
        riskLevel = "critical"
        riskScore = 90
        riskMessage = "HIGH RISK: File appears to be encrypted (ransomware detected!)"
      } else if (entropy > 7.0) {
        riskLevel = "high"
        riskScore = 70
        riskMessage = "Suspicious: High entropy detected - possible encryption"
      } else if (entropy > 6.0) {
        riskLevel = "medium"
        riskScore = 40
        riskMessage = "Moderate: Elevated entropy level"
      } else {
        riskLevel = "low"
        riskScore = 10
        riskMessage = "Safe: Normal entropy level"
      }

      setFileResult({
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2),
        fileType: file.type || "Unknown",
        entropy: entropy.toFixed(2),
        riskLevel,
        riskScore,
        riskMessage,
        isEncrypted: entropy > 7.0,
      })
      
      setIsAnalyzing(false)
    }

    reader.readAsArrayBuffer(file.slice(0, Math.min(file.size, 1000000))) // 只分析前1MB
  }

  // 重置检测
  const resetDetection = () => {
    setUploadedFile(null)
    setFileResult(null)
  }

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

          {/* File Detection Section */}
          <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileQuestion className="w-8 h-8 text-accent" />
              <div>
                <h2 className="text-2xl font-bold">File Detection</h2>
                <p className="text-white/60">Upload any file to check for ransomware signs</p>
              </div>
            </div>

            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragOver 
                    ? "border-accent bg-accent/10" 
                    : "border-white/20 hover:border-white/40"
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <Upload className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop file here or click to upload</h3>
                <p className="text-white/60 mb-4">
                  Supports all file types - checks for high entropy (encrypted files)
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-accent text-dark px-6 py-3 rounded-full font-semibold cursor-pointer hover:bg-accent/90 transition-all"
                >
                  Choose File
                </label>
              </div>
            ) : (
              <div>
                {/* File Info */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">{uploadedFile.name}</h3>
                    <p className="text-white/60">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={resetDetection}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Analysis Result */}
                {isAnalyzing ? (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      <Zap className="w-12 h-12 text-accent" />
                    </motion.div>
                    <p className="mt-4 text-white/70">Analyzing file...</p>
                  </div>
                ) : fileResult ? (
                  <div className="space-y-6">
                    {/* Risk Level */}
                    <div className={`rounded-xl p-6 ${
                      fileResult.riskLevel === "critical" 
                        ? "bg-danger/20 border border-danger/50"
                        : fileResult.riskLevel === "high"
                        ? "bg-orange-500/20 border border-orange-500/50"
                        : fileResult.riskLevel === "medium"
                        ? "bg-yellow-500/20 border border-yellow-500/50"
                        : "bg-safe/20 border border-safe/50"
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        {fileResult.riskLevel === "critical" || fileResult.riskLevel === "high" ? (
                          <AlertTriangle className="w-8 h-8 text-danger" />
                        ) : fileResult.riskLevel === "medium" ? (
                          <AlertTriangle className="w-8 h-8 text-yellow-500" />
                        ) : (
                          <CheckCircle2 className="w-8 h-8 text-safe" />
                        )}
                        <h4 className="text-xl font-bold">
                          {fileResult.riskLevel === "critical" ? "CRITICAL RISK!" :
                           fileResult.riskLevel === "high" ? "High Risk" :
                           fileResult.riskLevel === "medium" ? "Medium Risk" : "No Risk Detected"}
                        </h4>
                      </div>
                      <p className="text-lg">{fileResult.riskMessage}</p>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-white/60 text-sm mb-1">Entropy Score</p>
                        <p className="text-3xl font-bold">{fileResult.entropy}</p>
                        <p className="text-xs text-white/40 mt-1">
                          (Normal: &lt; 7.0, Suspicious: &gt; 7.0)
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-white/60 text-sm mb-1">Risk Score</p>
                        <p className={`text-3xl font-bold ${
                          fileResult.riskLevel === "critical" 
                            ? "text-danger"
                            : fileResult.riskLevel === "high"
                            ? "text-orange-500"
                            : fileResult.riskLevel === "medium"
                            ? "text-yellow-500"
                            : "text-safe"
                        }`}>{fileResult.riskScore}/100</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
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
