import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "../../src/health/health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("check", () => {
    it("should return health status with timestamp and uptime", () => {
      const mockUptime = 123.456;

      jest.spyOn(process, "uptime").mockReturnValue(mockUptime);

      const mockDate = new Date("2023-01-01T00:00:00.000Z");

      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      const result = controller.check();

      expect(result).toEqual({
        status: "ok",
        timestamp: "2023-01-01T00:00:00.000Z",
        uptime: mockUptime,
      });

      jest.restoreAllMocks();
    });

    it("should return ok status", () => {
      const result = controller.check();

      expect(result.status).toBe("ok");
    });

    it("should include timestamp", () => {
      const result = controller.check();

      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe("string");
    });

    it("should include uptime", () => {
      const result = controller.check();

      expect(result.uptime).toBeDefined();
      expect(typeof result.uptime).toBe("number");
    });
  });
});
