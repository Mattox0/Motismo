import { Test } from "@nestjs/testing";
import { RedisModule } from "@/redis/redis.module";
import { RedisService } from "@/redis/service/redis.service";

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
};

describe("RedisModule", () => {
  it("should compile the module", async () => {
    const module = await Test.createTestingModule({
      imports: [RedisModule],
    })
      .useMocker((token) => {
        if (token === RedisService) {
          return mockRedisService;
        }
      })
      .compile();

    expect(module).toBeDefined();
  });
});
