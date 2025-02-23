import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "@/user/controller/user.controller";
import { UserService } from "@/user/service/user.service";
import { TranslationService } from "@/translation/translation.service";
import { HttpException, HttpStatus } from "@nestjs/common";
import { FileUploadService } from "@/files/files.service";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";
import { UserUpdatedDto } from "@/user/dto/userUpdated.dto";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockImplementation(() => "hashed-new-password"),
}));

describe("UserController", () => {
  let userController: UserController;
  let mockUserService: Partial<UserService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockFileUploadService: Partial<FileUploadService>;
  let mockUserRepository: Partial<Repository<User>>;

  const mockUser: User = {
    id: "user-id",
    username: "testuser",
    email: "test@example.com",
    role: Role.Customer,
    password: "hashed-password",
    creationDate: new Date(),
  };

  const adminUser: User = Object.assign({}, mockUser, {
    role: Role.Admin,
  });

  const mockUsers: User[] = [mockUser, adminUser];

  beforeEach(async () => {
    mockUserRepository = {};

    mockUserService = {
      getAll: jest.fn().mockResolvedValue(mockUsers),
      findOneUser: jest
        .fn()
        .mockImplementation((id: string) =>
          Promise.resolve(mockUsers.find((user) => user.id === id)),
        ),
      update: jest
        .fn()
        .mockResolvedValue(
          Object.assign({}, mockUser, { username: "updatedUser" }),
        ),
      delete: jest.fn().mockResolvedValue(undefined),
      checkUnknownUser: jest.fn().mockResolvedValue(false),
    };

    mockTranslationService = {
      translate: jest.fn((key) => Promise.resolve(key)),
    };

    mockFileUploadService = {
      uploadFile: jest
        .fn()
        .mockResolvedValue({ url: "http://example.com/file.jpg" }),
      getFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: FileUploadService, useValue: mockFileUploadService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  describe("getAll", () => {
    it("should return an array of users", async () => {
      const users: User[] = [mockUser];

      jest.spyOn(mockUserService, "getAll").mockResolvedValue(users);

      expect(await userController.getAll()).toEqual(users);
    });
  });

  describe("getMe", () => {
    it("should return the current user", async () => {
      jest.spyOn(mockUserService, "findOneUser").mockResolvedValue(mockUser);
      expect(await userController.getMe(mockUser)).toEqual(mockUser);
    });
  });

  describe("getOneUser", () => {
    it("should return a user by ID", () => {
      expect(userController.getOneUser(mockUser)).toEqual(mockUser);
    });
  });

  describe("update", () => {
    it("should update the user if authorized", async () => {
      const userUpdateData: UserUpdatedDto = { username: "updatedUser" };
      const updatedUser: User = Object.assign({}, mockUser, userUpdateData);

      jest.spyOn(mockUserService, "checkUnknownUser").mockResolvedValue(false);
      jest.spyOn(mockUserService, "update").mockResolvedValue(undefined);
      jest.spyOn(mockUserService, "findOneUser").mockResolvedValue(updatedUser);

      const result = await userController.update(
        mockUser,
        mockUser,
        userUpdateData,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(
        mockUser.id,
        userUpdateData,
      );
    });

    it("should throw conflict error if user already exists", async () => {
      jest.spyOn(mockUserService, "checkUnknownUser").mockResolvedValue(true);

      await expect(
        userController.update(mockUser, mockUser, {}),
      ).rejects.toThrow(
        new HttpException("error.USER_EXIST", HttpStatus.CONFLICT),
      );
    });

    it("should throw unauthorized error if user is not admin or updating own account", async () => {
      const nonAdminUser: User = Object.assign({}, mockUser, {
        id: "another-id",
      });

      jest
        .spyOn(mockTranslationService, "translate")
        .mockResolvedValue("error.USER_NOT_ADMIN");

      await expect(
        userController.update(nonAdminUser, mockUser, {}),
      ).rejects.toThrow(
        new HttpException("error.USER_NOT_ADMIN", HttpStatus.UNAUTHORIZED),
      );
    });

    it("should hash password when updating password", async () => {
      const newPassword = "newPassword123";
      const hashedPassword = "hashed-new-password";
      const userUpdateData: UserUpdatedDto = { password: newPassword };
      const updatedUser = { ...mockUser, password: hashedPassword };

      jest.spyOn(mockUserService, "checkUnknownUser").mockResolvedValue(false);
      jest.spyOn(mockUserService, "update").mockResolvedValue(undefined);
      jest.spyOn(mockUserService, "findOneUser").mockResolvedValue(updatedUser);

      const result = await userController.update(
        mockUser,
        mockUser,
        userUpdateData,
      );

      expect(mockUserService.update).toHaveBeenCalledWith(mockUser.id, {
        password: hashedPassword,
      });
      expect(result).toEqual(updatedUser);
    });

    it("should update user with uploaded file", async () => {
      const apiBaseUrl = "http://localhost:3000";

      process.env.VITE_API_BASE_URL = apiBaseUrl;

      const mockFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
        size: 1024,
      } as Express.Multer.File;

      const fileName = "uploaded-file-name.jpg";
      const userUpdateData: UserUpdatedDto = { username: "updatedUser" };
      const expectedImageUrl = `${apiBaseUrl}/files/${fileName}`;

      jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockResolvedValue(fileName);

      const updatedUser = {
        ...mockUser,
        ...userUpdateData,
        image: expectedImageUrl,
      };

      jest.spyOn(mockUserService, "checkUnknownUser").mockResolvedValue(false);
      jest.spyOn(mockUserService, "update").mockResolvedValue(undefined);
      jest.spyOn(mockUserService, "findOneUser").mockResolvedValue(updatedUser);

      const result = await userController.update(
        mockUser,
        mockUser,
        userUpdateData,
        mockFile,
      );

      expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(mockUserService.update).toHaveBeenCalledWith(mockUser.id, {
        username: "updatedUser",
        image: expectedImageUrl,
      });
      expect(result).toEqual(updatedUser);

      delete process.env.VITE_API_BASE_URL;
    });

    it("should throw NOT_FOUND if user not found after update", async () => {
      const mockFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test"),
        size: 1024,
      } as Express.Multer.File;

      const fileName = "uploaded-file-name.jpg";
      const userUpdateData: UserUpdatedDto = { username: "updatedUser" };

      jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockResolvedValue(fileName);

      jest.spyOn(mockUserService, "checkUnknownUser").mockResolvedValue(false);
      jest.spyOn(mockUserService, "update").mockResolvedValue(undefined);
      jest.spyOn(mockUserService, "findOneUser").mockResolvedValue(null);

      jest
        .spyOn(mockTranslationService, "translate")
        .mockResolvedValue("error.USER_NOT_FOUND");

      await expect(
        userController.update(mockUser, mockUser, userUpdateData, mockFile),
      ).rejects.toThrow(
        new HttpException("error.USER_NOT_FOUND", HttpStatus.NOT_FOUND),
      );

      expect(mockUserService.update).toHaveBeenCalled();
      expect(mockUserService.findOneUser).toHaveBeenCalledWith(mockUser.id);
      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        "error.USER_NOT_FOUND",
      );
    });
  });

  describe("delete", () => {
    it("should delete the user if authorized", async () => {
      const deleteSpy = jest
        .spyOn(mockUserService, "delete")
        .mockResolvedValue(undefined);

      await userController.delete(adminUser, mockUser);
      expect(deleteSpy).toHaveBeenCalledWith(mockUser.id);
    });

    it("should throw unauthorized error if user is not admin or deleting own account", async () => {
      const nonAdminUser: User = Object.assign({}, mockUser, {
        id: "another-id",
      });

      jest
        .spyOn(mockTranslationService, "translate")
        .mockResolvedValue("error.USER_NOT_ADMIN");

      await expect(
        userController.delete(nonAdminUser, mockUser),
      ).rejects.toThrow(
        new HttpException("error.USER_NOT_ADMIN", HttpStatus.UNAUTHORIZED),
      );
    });
  });
});
