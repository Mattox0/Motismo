import { Test, TestingModule } from "@nestjs/testing";
import { RedisService } from "@/redis/service/redis.service";

const mockRedis = {
  set: jest.fn(),
  get: jest.fn(),
  hset: jest.fn(),
  hget: jest.fn(),
  hgetall: jest.fn(),
  exists: jest.fn(),
  keys: jest.fn(),
  del: jest.fn(),
  lpush: jest.fn(),
  lrange: jest.fn(),
};

jest.mock("ioredis", () => ({
  Redis: jest.fn(() => mockRedis),
}));

describe("RedisService", () => {
  let redisService: RedisService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  });

  describe("set", () => {
    it("should set a key-value pair", async () => {
      const setSpy = jest.spyOn(mockRedis, "set");

      await redisService.set("key", "value");
      expect(setSpy).toHaveBeenCalledWith("key", "value");
    });
  });

  describe("get", () => {
    it("should get a value by key", async () => {
      const getSpy = jest.spyOn(mockRedis, "get").mockResolvedValue("value");
      const result = await redisService.get("key");

      expect(result).toBe("value");
      expect(getSpy).toHaveBeenCalledWith("key");
    });
  });

  describe("hset", () => {
    it("should set hash fields and values", async () => {
      const hsetSpy = jest.spyOn(mockRedis, "hset");
      const fieldAndValues = ["field1", "value1", "field2", "value2"];

      await redisService.hset("key", fieldAndValues);
      expect(hsetSpy).toHaveBeenCalledWith("key", ...fieldAndValues);
    });

    it("should throw error if arguments are not even", async () => {
      const fieldAndValues = ["field1", "value1", "field2"];

      await expect(redisService.hset("key", fieldAndValues)).rejects.toThrow(
        "The number of arguments must be even.",
      );
    });
  });

  describe("hget", () => {
    it("should get a hash field value", async () => {
      const hgetSpy = jest.spyOn(mockRedis, "hget").mockResolvedValue("value");
      const result = await redisService.hget("key", "field");

      expect(result).toBe("value");
      expect(hgetSpy).toHaveBeenCalledWith("key", "field");
    });
  });

  describe("hgetall", () => {
    it("should get all hash fields and values", async () => {
      const mockResult = { field1: "value1", field2: "value2" };
      const hgetallSpy = jest
        .spyOn(mockRedis, "hgetall")
        .mockResolvedValue(mockResult);
      const result = await redisService.hgetall("key");

      expect(result).toEqual(mockResult);
      expect(hgetallSpy).toHaveBeenCalledWith("key");
    });
  });

  describe("exists", () => {
    it("should check if a key exists", async () => {
      const existsSpy = jest.spyOn(mockRedis, "exists").mockResolvedValue(1);
      const result = await redisService.exists("key");

      expect(result).toBe(1);
      expect(existsSpy).toHaveBeenCalledWith("key");
    });
  });

  describe("keys", () => {
    it("should get keys matching pattern", async () => {
      const mockKeys = ["key1", "key2"];
      const keysSpy = jest.spyOn(mockRedis, "keys").mockResolvedValue(mockKeys);
      const result = await redisService.keys("pattern*");

      expect(result).toEqual(mockKeys);
      expect(keysSpy).toHaveBeenCalledWith("pattern*");
    });
  });

  describe("del", () => {
    it("should delete a key", async () => {
      const delSpy = jest.spyOn(mockRedis, "del");

      await redisService.del("key");
      expect(delSpy).toHaveBeenCalledWith("key");
    });
  });

  describe("push", () => {
    it("should push a value to a list", async () => {
      const lpushSpy = jest.spyOn(mockRedis, "lpush");

      await redisService.push("key", "value");
      expect(lpushSpy).toHaveBeenCalledWith("key", "value");
    });
  });

  describe("lgetall", () => {
    it("should get all values from a list", async () => {
      const mockValues = ["value1", "value2"];
      const lrangeSpy = jest
        .spyOn(mockRedis, "lrange")
        .mockResolvedValue(mockValues);
      const result = await redisService.lgetall("key");

      expect(result).toEqual(mockValues);
      expect(lrangeSpy).toHaveBeenCalledWith("key", 0, -1);
    });
  });
});
