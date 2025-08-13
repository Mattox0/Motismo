import { Test, TestingModule } from "@nestjs/testing";
import { GameUserService } from "@/gameUser/service/gameUser.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GameUser } from "@/gameUser/gameUser.entity";
import { TranslationService } from "@/translation/translation.service";

describe("GameUserService", () => {
  let service: GameUserService;
  let mockGameUserRepository: any;
  let mockTranslationService: any;

  beforeEach(async () => {
    mockGameUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("translated message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameUserService,
        {
          provide: getRepositoryToken(GameUser),
          useValue: mockGameUserRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    service = module.get<GameUserService>(GameUserService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getUsersByCode", () => {
    it("should return non-author users by game code", async () => {
      const mockUsers = [
        { id: "user-1", name: "Player 1", isAuthor: false },
        { id: "user-2", name: "Player 2", isAuthor: false },
      ];

      mockGameUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.getUsersByCode("ABCDEF");

      expect(mockGameUserRepository.find).toHaveBeenCalledWith({
        where: {
          isAuthor: false,
          game: {
            code: "ABCDEF",
          },
        },
        relations: {
          game: true,
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it("should return empty array if no users found", async () => {
      mockGameUserRepository.find.mockResolvedValue([]);

      const result = await service.getUsersByCode("INVALID");

      expect(result).toEqual([]);
    });
  });

  describe("getOneUser", () => {
    it("should return user by id", async () => {
      const mockUser = { id: "user-id", name: "Test User" };

      mockGameUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getOneUser("user-id");

      expect(mockGameUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "user-id" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockGameUserRepository.findOne.mockResolvedValue(null);

      const result = await service.getOneUser("invalid-id");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and save a game user", async () => {
      const createUserPayload = {
        game: { id: "game-id" },
        socketId: "socket-123",
        name: "Test User",
        isAuthor: false,
        avatar: "avatar-url",
      };

      const mockGameUser = { id: "new-user-id", ...createUserPayload };

      mockGameUserRepository.create.mockReturnValue(mockGameUser);
      mockGameUserRepository.save.mockResolvedValue(mockGameUser);

      const result = await service.create(createUserPayload as any);

      expect(mockGameUserRepository.create).toHaveBeenCalledWith(createUserPayload);
      expect(mockGameUserRepository.save).toHaveBeenCalledWith(mockGameUser);
      expect(result).toEqual(mockGameUser);
    });

    it("should create author user", async () => {
      const createUserPayload = {
        game: { id: "game-id" },
        socketId: "socket-123",
        name: "Author User",
        isAuthor: true,
        avatar: "avatar-url",
      };

      const mockGameUser = { id: "author-id", ...createUserPayload };

      mockGameUserRepository.create.mockReturnValue(mockGameUser);
      mockGameUserRepository.save.mockResolvedValue(mockGameUser);

      const result = await service.create(createUserPayload as any);

      expect(result.isAuthor).toBe(true);
    });
  });

  describe("updateSocketId", () => {
    it("should update socket id for user", async () => {
      const mockSocket = {
        data: {
          user: {
            userId: "user-id",
            socketId: "new-socket-123",
          },
        },
      };

      const mockGame = { id: "game-id" };

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      mockGameUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.updateSocketId(mockSocket as any, mockGame as any);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(GameUser);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        socketId: "new-socket-123",
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("id = :id and game.id = :game", {
        id: "user-id",
        game: "game-id",
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe("getUserBySocketId", () => {
    it("should return user by socket id", async () => {
      const mockUser = {
        id: "user-id",
        socketId: "socket-123",
        game: { id: "game-id" },
      };

      mockGameUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserBySocketId("socket-123");

      expect(mockGameUserRepository.findOne).toHaveBeenCalledWith({
        where: { socketId: "socket-123" },
        relations: { game: true },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found by socket id", async () => {
      mockGameUserRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserBySocketId("invalid-socket");

      expect(result).toBeNull();
    });
  });

  describe("addPoints", () => {
    it("should add points to user", async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      mockGameUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.addPoints("user-id", 100);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(GameUser);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        points: expect.any(Function),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("id = :id", {
        id: "user-id",
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it("should handle negative points", async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      mockGameUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.addPoints("user-id", -50);

      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        points: expect.any(Function),
      });
    });
  });

  describe("getGameUsersByGameId", () => {
    it("should return non-author users by game id", async () => {
      const mockUsers = [
        { id: "user-1", name: "Player 1", isAuthor: false },
        { id: "user-2", name: "Player 2", isAuthor: false },
      ];

      mockGameUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.getGameUsersByGameId("game-id");

      expect(mockGameUserRepository.find).toHaveBeenCalledWith({
        where: {
          game: { id: "game-id" },
          isAuthor: false,
        },
        relations: {
          game: true,
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it("should return empty array if no game users found", async () => {
      mockGameUserRepository.find.mockResolvedValue([]);

      const result = await service.getGameUsersByGameId("invalid-game-id");

      expect(result).toEqual([]);
    });
  });
});
