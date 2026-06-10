require("dotenv").config()
const { sequelize } = require("../config/database")
const { User, MonitoringSession, Alert, FileEvent, CanaryFile, Process, Settings } = require("../models")

const seed = async () => {
  console.log("Starting seed...")

  await sequelize.sync({ force: true })
  console.log("Database synced!")

  const testUser = await User.create({
    clerkId: "test_clerk_id_123",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    lastLogin: new Date(),
  })
  console.log("Test user created:", testUser.id)

  const testSession = await MonitoringSession.create({
    userId: testUser.id,
    status: "active",
    watchDirectories: ["C:\\Users\\test\\Documents", "C:\\Users\\test\\Desktop"],
    totalFilesMonitored: 4821,
    totalAlertsCount: 3,
    attackStopped: true,
  })
  console.log("Test session created:", testSession.id)

  await Settings.create({
    userId: testUser.id,
    watchDirectories: ["C:\\Users\\test\\Documents", "C:\\Users\\test\\Desktop"],
    entropyThreshold: 7.0,
    threatScoreThreshold: 80,
    filesPerMinThreshold: 200,
    autoKillSwitch: true,
    emailAlerts: false,
    canaryFilesPerDir: 5,
    autoStartMonitoring: false,
  })
  console.log("Settings created")

  await Alert.create({
    sessionId: testSession.id,
    userId: testUser.id,
    type: "critical",
    message: "Canary file touched: important_passwords.txt",
    processName: "update.exe",
    processPid: 4821,
    filePath: "C:\\Users\\test\\Documents\\important_passwords.txt",
    entropyScore: 7.8,
    threatScore: 94,
    networkAction: "isolated",
    isCanaryAlert: true,
    acknowledged: false,
  })
  console.log("Critical alert created")

  await Alert.create({
    sessionId: testSession.id,
    userId: testUser.id,
    type: "warning",
    message: "High entropy detected in budget.xlsx",
    processName: "chrome.exe",
    processPid: 3201,
    filePath: "C:\\Users\\test\\Documents\\budget.xlsx",
    entropyScore: 6.9,
    threatScore: 65,
    networkAction: "none",
    isCanaryAlert: false,
    acknowledged: false,
  })
  console.log("Warning alert created")

  await Alert.create({
    sessionId: testSession.id,
    userId: testUser.id,
    type: "info",
    message: "Unusual file rename activity detected",
    processName: "explorer.exe",
    processPid: 1234,
    filePath: "C:\\Users\\test\\Documents\\report.docx",
    entropyScore: 4.2,
    threatScore: 28,
    networkAction: "none",
    isCanaryAlert: false,
    acknowledged: false,
  })
  console.log("Info alert created")

  await FileEvent.create({
    sessionId: testSession.id,
    filePath: "C:\\Users\\test\\Documents\\report.docx",
    fileName: "report.docx",
    fileExtension: "docx",
    eventType: "modified",
    processName: "update.exe",
    processPid: 4821,
    entropyBefore: 3.1,
    entropyAfter: 7.8,
    fileSize: 102400,
  })
  console.log("File event created")

  await FileEvent.create({
    sessionId: testSession.id,
    filePath: "C:\\Users\\test\\Documents\\budget.xlsx",
    fileName: "budget.xlsx",
    fileExtension: "xlsx",
    eventType: "renamed",
    processName: "update.exe",
    processPid: 4821,
    entropyBefore: 2.9,
    entropyAfter: 7.6,
    fileSize: 204800,
  })
  console.log("Second file event created")

  await CanaryFile.create({
    sessionId: testSession.id,
    filePath: "C:\\Users\\test\\Documents\\important_passwords.txt",
    fileName: "important_passwords.txt",
    directory: "C:\\Users\\test\\Documents",
    status: "touched",
    touchedBy: "update.exe",
    touchedByPid: 4821,
    touchedAt: new Date(),
  })
  console.log("Touched canary file created")

  await CanaryFile.create({
    sessionId: testSession.id,
    filePath: "C:\\Users\\test\\Documents\\bank_details.docx",
    fileName: "bank_details.docx",
    directory: "C:\\Users\\test\\Documents",
    status: "safe",
  })
  console.log("Safe canary file created")

  await CanaryFile.create({
    sessionId: testSession.id,
    filePath: "C:\\Users\\test\\Desktop\\private_keys.txt",
    fileName: "private_keys.txt",
    directory: "C:\\Users\\test\\Desktop",
    status: "safe",
  })
  console.log("Third canary file created")

  await Process.create({
    sessionId: testSession.id,
    processName: "update.exe",
    pid: 4821,
    filesPerMin: 487,
    renameRate: 62,
    totalFilesAccessed: 156,
    threatScore: 94,
    status: "critical",
    lastSeen: new Date(),
    cpuUsage: 45.2,
    memoryUsage: 210.5,
  })
  console.log("Critical process created")

  await Process.create({
    sessionId: testSession.id,
    processName: "chrome.exe",
    pid: 3201,
    filesPerMin: 12,
    renameRate: 0,
    totalFilesAccessed: 25,
    threatScore: 8,
    status: "safe",
    lastSeen: new Date(),
    cpuUsage: 12.5,
    memoryUsage: 850.3,
  })
  console.log("Safe process created")

  await Process.create({
    sessionId: testSession.id,
    processName: "explorer.exe",
    pid: 1234,
    filesPerMin: 34,
    renameRate: 3,
    totalFilesAccessed: 89,
    threatScore: 22,
    status: "safe",
    lastSeen: new Date(),
    cpuUsage: 5.8,
    memoryUsage: 120.7,
  })
  console.log("Third process created")

  console.log("Seeding complete!")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seeding failed:", err)
  process.exit(1)
})
