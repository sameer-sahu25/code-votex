// Mock database connection
jest.mock('../src/config/database', () => ({
  connectDB: jest.fn().mockResolvedValue()
}));

// Mock jobs
jest.mock('../src/jobs', () => ({
  startJobs: jest.fn()
}));

// Mock alert service
jest.mock('../src/services/alert.service', () => ({
  setIo: jest.fn()
}));
