import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "@/user/service/user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@/user/user.entity";
import { TranslationService } from "@/translation/translation.service";
import { Role } from "@/user/role.enum";
import { HttpException } from "@nestjs/common";
import { UserUpdatedDto } from "@/user/dto/userUpdated.dto";
import { Repository } from "typeorm";
import { Request } from "express";

const mockUserRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockTranslationService = {
  translate: jest.fn((key: string) => key),
};

describe("UserService", () => {
  let service: UserService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const user1: User = {
        id: "1",
        email: "test@example.com",
        password: "securepassword",
        role: Role.Customer,
        username: "testuser",
        creationDate: new Date(),
      };

      mockUserRepository.find.mockResolvedValue([user1]);

      const result = await service.getAll();

      expect(result).toEqual([user1]);
    });
  });

  describe("create", () => {
    it("should create and save a new user", async () => {
      const userDto = {
        username: "testuser",
        email: "test@example.com",
        password: "securepassword",
        role: Role.Customer,
      };

      mockUserRepository.create.mockReturnValue(userDto);
      mockUserRepository.save.mockResolvedValue(userDto);

      const result = await service.create(userDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(userDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(userDto);
      expect(result).toEqual(userDto);
    });
  });

  describe("update", () => {
    it("should throw HttpException if user not found", async () => {
      mockUserRepository.createQueryBuilder.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      });

      await expect(service.update("12345", { username: "updatedUser" } as UserUpdatedDto)).rejects.toThrow(
        HttpException,
      );

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.USER_NOT_FOUND");
    });
  });

  describe("update", () => {
    it("should update a user successfully", async () => {
      const userId = "123";
      const userUpdateDto = { username: "UpdatedUser" };

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest
        .spyOn(userRepo, "createQueryBuilder")

        .mockImplementation(() => mockQueryBuilder as any);

      await service.update(userId, userUpdateDto);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(User);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(userUpdateDto);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("id = :id", {
        id: userId,
      });
    });

    it("should throw an exception if user is not found", async () => {
      const userId = "123";
      const userUpdateDto = { username: "UpdatedUser" };

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      jest
        .spyOn(userRepo, "createQueryBuilder")

        .mockImplementation(() => mockQueryBuilder as any);

      await expect(service.update(userId, userUpdateDto)).rejects.toThrow(HttpException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.USER_NOT_FOUND");
    });
  });

  describe("delete", () => {
    it("should delete a user successfully", async () => {
      const userId = "123";

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest
        .spyOn(userRepo, "createQueryBuilder")

        .mockImplementation(() => mockQueryBuilder as any);

      await service.delete(userId);

      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(User);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("id = :id", {
        id: userId,
      });
    });

    it("should throw an exception if user is not found", async () => {
      const userId = "123";

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      jest
        .spyOn(userRepo, "createQueryBuilder")

        .mockImplementation(() => mockQueryBuilder as any);

      await expect(service.delete(userId)).rejects.toThrow(HttpException);

      expect(mockTranslationService.translate).toHaveBeenCalledWith("error.USER_NOT_FOUND");
    });

    describe("findOneEmail", () => {
      it("should find user by email", async () => {
        const email = "test@example.com";
        const mockUser = { id: "1", email, username: "TestUser" };

        jest.spyOn(userRepo, "createQueryBuilder").mockImplementation(
          () =>
            ({
              where: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(mockUser),
            }) as any,
        );

        const result = await service.findOneEmail(email);

        expect(result).toEqual(mockUser);
      });
    });

    describe("findOneUser", () => {
      it("should return the user with the given ID including relations and password", async () => {
        const mockUser: User = {
          id: "123",
          username: "TestUser",
          email: "test@example.com",
          password: "encrypted-password",
          creationDate: new Date(),
          role: Role.Customer,
        };

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(mockUser),
        };

        jest
          .spyOn(userRepo, "createQueryBuilder")

          .mockImplementation(() => mockQueryBuilder as any);

        const result = await service.findOneUser("123");

        expect(mockQueryBuilder.where).toHaveBeenCalledWith("user.id = :id", {
          id: "123",
        });
        expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith("user.password");
        expect(result).toEqual(mockUser);
      });

      it("should return null if no user is found", async () => {
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        };

        jest
          .spyOn(userRepo, "createQueryBuilder")

          .mockImplementation(() => mockQueryBuilder as any);

        const result = await service.findOneUser("not_found_id");

        expect(mockQueryBuilder.where).toHaveBeenCalledWith("user.id = :id", {
          id: "not_found_id",
        });
        expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith("user.password");
        expect(result).toBeNull();
      });
    });

    describe("getUserConnected", () => {
      it("should return null if no user is in the request", async () => {
        const request: Request = {
          user: undefined,
        } as Request;

        const result = await service.getUserConnected(request);

        expect(result).toBeNull();
      });

      it("should return a user if connected", async () => {
        const mockUser: User = {
          id: "123",
          username: "ConnectedUser",
          password: "password",
          email: "yoohoo@yoohoo.fr",
          creationDate: new Date(),
          role: Role.Customer,
        };

        const request = {
          user: { id: "123" },
        } as unknown as Request;

        jest.spyOn(service, "findOneUser").mockResolvedValue(mockUser);

        const result = await service.getUserConnected(request);

        expect(result).toEqual(mockUser);
      });
    });

    describe("checkUnknownUser", () => {
      it("should return false if no user with the same username or email is found", async () => {
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        };

        jest
          .spyOn(userRepo, "createQueryBuilder")

          .mockImplementation(() => mockQueryBuilder as any);

        const userDto = {
          username: "new_user",
          email: "new_user@example.com",
        };

        const result = await service.checkUnknownUser(userDto);

        expect(mockQueryBuilder.where).toHaveBeenCalledWith("user.username = :username", {
          username: userDto.username,
        });
        expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith("user.email = :email", {
          email: userDto.email,
        });
        expect(result).toBe(false);
      });

      it("should return true if a user with a different ID is found", async () => {
        const mockExistingUser = {
          id: "123",
          username: "existing_user",
          email: "existing_user@example.com",
        };

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(mockExistingUser),
        };

        jest
          .spyOn(userRepo, "createQueryBuilder")

          .mockImplementation(() => mockQueryBuilder as any);

        const userDto = {
          username: "existing_user",
          email: "existing_user@example.com",
        };

        const result = await service.checkUnknownUser(userDto, "456");

        expect(mockQueryBuilder.where).toHaveBeenCalledWith("user.username = :username", {
          username: userDto.username,
        });
        expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith("user.email = :email", {
          email: userDto.email,
        });
        expect(result).toBe(true);
      });

      it("should return false if a user with the same ID is found", async () => {
        const mockExistingUser = {
          id: "123",
          username: "existing_user",
          email: "existing_user@example.com",
        };

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(mockExistingUser),
        };

        jest
          .spyOn(userRepo, "createQueryBuilder")

          .mockImplementation(() => mockQueryBuilder as any);

        const userDto = {
          username: "existing_user",
          email: "existing_user@example.com",
        };

        const result = await service.checkUnknownUser(userDto, "123");

        expect(mockQueryBuilder.where).toHaveBeenCalledWith("user.username = :username", {
          username: userDto.username,
        });
        expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith("user.email = :email", {
          email: userDto.email,
        });
        expect(result).toBe(false);
      });

      it("should return false if no user is found (unknownUser === null)", async () => {
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        };

        jest
          .spyOn(userRepo, "createQueryBuilder")

          .mockImplementation(() => mockQueryBuilder as any);

        const userDto = {
          username: "new_user",
          email: "new_user@example.com",
        };

        const result = await service.checkUnknownUser(userDto);

        expect(mockQueryBuilder.where).toHaveBeenCalledWith("user.username = :username", {
          username: userDto.username,
        });
        expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith("user.email = :email", {
          email: userDto.email,
        });

        expect(result).toBe(false);
      });

      it("should return false if a user is found and its ID matches the provided userId", async () => {
        const mockExistingUser = {
          id: "123",
          username: "existing_user",
          email: "existing_user@example.com",
        };

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(mockExistingUser),
        };

        jest
          .spyOn(userRepo, "createQueryBuilder")

          .mockImplementation(() => mockQueryBuilder as any);

        const userDto = {
          username: "existing_user",
          email: "existing_user@example.com",
        };

        const result = await service.checkUnknownUser(userDto, "123");

        expect(mockQueryBuilder.where).toHaveBeenCalledWith("user.username = :username", {
          username: userDto.username,
        });
        expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith("user.email = :email", {
          email: userDto.email,
        });

        expect(result).toBe(false);
      });

      it("should return true if a user is found but its ID does not match the provided userId", async () => {
        const mockExistingUser = {
          id: "456",
          username: "existing_user",
          email: "existing_user@example.com",
        };

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(mockExistingUser),
        };

        jest
          .spyOn(userRepo, "createQueryBuilder")

          .mockImplementation(() => mockQueryBuilder as any);

        const userDto = {
          username: "existing_user",
          email: "existing_user@example.com",
        };

        const result = await service.checkUnknownUser(userDto, "123");

        expect(mockQueryBuilder.where).toHaveBeenCalledWith("user.username = :username", {
          username: userDto.username,
        });
        expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith("user.email = :email", {
          email: userDto.email,
        });

        expect(result).toBe(true);
      });

      it("should return true if a user is found but no userId is provided", async () => {
        const mockExistingUser = {
          id: "456",
          username: "existing_user",
          email: "existing_user@example.com",
        };

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(mockExistingUser),
        };

        jest
          .spyOn(userRepo, "createQueryBuilder")

          .mockImplementation(() => mockQueryBuilder as any);

        const userDto = {
          username: "existing_user",
          email: "existing_user@example.com",
        };

        const result = await service.checkUnknownUser(userDto);

        expect(mockQueryBuilder.where).toHaveBeenCalledWith("user.username = :username", {
          username: userDto.username,
        });
        expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith("user.email = :email", {
          email: userDto.email,
        });
        expect(result).toBe(true);
      });
    });
  });
});
