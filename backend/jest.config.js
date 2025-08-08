module.exports = {
  moduleFileExtensions: ["js", "json", "ts", "d.ts"],
  moduleDirectories: ["node_modules", "src"],
  testEnvironment: "node",
  testRegex: "test/.*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.{js,ts}", "!src/main.ts", "!src/app.module.ts", "!src/instrument.ts"],
  testTimeout: 10000,
  forceExit: true,
  rootDir: ".",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
