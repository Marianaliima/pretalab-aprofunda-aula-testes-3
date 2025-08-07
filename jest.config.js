const { createDefaultPreset } = require('ts-jest');

module.exports = {
  ...createDefaultPreset(),
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/main.ts'],
  maxWorkers: 1,
  testTimeout: 15000,
  detectOpenHandles: true,
  forceExit: true,
};
