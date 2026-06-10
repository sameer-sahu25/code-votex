// Mock database connection
const mockSequelize = {
  define: jest.fn(() => ({
    sync: jest.fn(),
    belongsTo: jest.fn(),
    hasMany: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  })),
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue()
};

jest.mock('../src/config/database', () => ({
  sequelize: mockSequelize,
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

// Mock socket config
jest.mock('../src/config/socket', () => ({
  initSocket: jest.fn(() => ({ on: jest.fn() }))
}));
