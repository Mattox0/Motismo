import { Test, TestingModule } from "@nestjs/testing";

import { AuthController } from "@/auth/controller/auth.controller";
import { AuthService } from "@/auth/service/auth.service";
import { UserService } from "@/user/service/user.service";
import { TranslationService } from "@/translation/translation.service";
import { LoginDto } from "@/auth/dto/login.dto";
import { RegisterDto } from "@/auth/dto/register.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { FileUploadService } from "@/files/files.service";
import { Response } from "express";
import { Role } from "@/user/role.enum";

describe("AuthController", () => {
  let authController: AuthController;
  let mockAuthService: Partial<AuthService>;
  let mockUserService: Partial<UserService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockFileUploadService: Partial<FileUploadService>;

  beforeEach(async () => {
    mockFileUploadService = {
      uploadFile: jest.fn(),
    };

    mockAuthService = {
      login: jest.fn().mockResolvedValue({ accessToken: "test-token" }),
    };

    mockUserService = {
      findOneEmail: jest.fn(),
      checkUnknownUser: jest.fn(),
      create: jest.fn(),
    };

    mockTranslationService = {
      translate: jest.fn().mockResolvedValue("Translated error message"),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: FileUploadService, useValue: mockFileUploadService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  describe("login", () => {
    it("should successfully login with correct credentials", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        id: "1",
        username: "oui",
        creationDate: new Date(),
        role: Role.Customer,
        email: "test@example.com",
        password: await bcrypt.hash("password123", 10),
        rating: [],
      };

      jest.spyOn(mockUserService, "findOneEmail").mockResolvedValue(mockUser);
      jest
        .spyOn(mockAuthService, "login")
        .mockReturnValue({ accessToken: "test-token" });

      const mockSend = jest.fn();
      const response: Partial<Response> = {
        cookie: jest.fn(),
        send: mockSend,
      };

      await authController.login(loginDto, response as Response);

      expect(mockUserService.findOneEmail).toHaveBeenCalledWith(loginDto.email);
      expect(response.cookie).toHaveBeenCalledWith(
        "access_token",
        "test-token",
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockSend).toHaveBeenCalledWith({ accessToken: "test-token" });
    });

    it("should throw NotFoundExeption for non-existent user", async () => {
      const loginDto: LoginDto = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      jest.spyOn(mockUserService, "findOneEmail").mockResolvedValue(null);

      const response = {
        cookie: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await expect(authController.login(loginDto, response)).rejects.toThrow(
        HttpException,
      );
      await expect(
        authController.login(loginDto, response),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it("should throw NotFoundException for incorrect password", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const mockUser = {
        id: "2",
        creationDate: new Date(),
        role: Role.Customer,
        username: "oui",
        email: "test@example.com",
        password: await bcrypt.hash("correctpassword", 10),
        rating: [],
      };

      jest.spyOn(mockUserService, "findOneEmail").mockResolvedValue(mockUser);

      const response = {
        cookie: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await expect(authController.login(loginDto, response)).rejects.toThrow(
        HttpException,
      );
      await expect(
        authController.login(loginDto, response),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe("register", () => {
    it("should successfully register a new user with an uploaded file", async () => {
      const registerDto: RegisterDto = {
        email: "newuser@example.com",
        password: "password123",
        username: "John",
      };

      const mockCreatedUser = {
        id: "3",
        ...registerDto,
        password: await bcrypt.hash(registerDto.password, 10),
        role: Role.Customer,
        creationDate: new Date(),
        rating: [],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        image: expect.any(String),
      };

      const mockSend = jest.fn();
      const response: Partial<Response> = {
        cookie: jest.fn(),
        send: mockSend,
      };

      const mockFile = {
        originalname: "dummyImage.jpg",
        buffer: Buffer.from([]),
      } as Express.Multer.File;

      jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockResolvedValue("uploadedImage.jpg");

      jest.spyOn(mockUserService, "checkUnknownUser").mockResolvedValue(false);
      jest.spyOn(mockUserService, "create").mockResolvedValue(mockCreatedUser);
      jest
        .spyOn(mockAuthService, "login")
        .mockReturnValue({ accessToken: "test-token" });

      process.env.VITE_API_BASE_URL = "http://test-url.com";

      await authController.register(
        registerDto,
        response as Response,
        mockFile,
      );
      expect(mockUserService.checkUnknownUser).toHaveBeenCalledWith(
        registerDto,
      );
      expect(mockUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          image: expect.stringContaining(
            "http://test-url.com/files/uploadedImage.jpg",
          ),
        }),
      );
      expect(response.cookie).toHaveBeenCalledWith(
        "access_token",
        "test-token",
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockSend).toHaveBeenCalledWith({ accessToken: "test-token" });
    });

    it("should successfully register a new user with an uploaded file", async () => {
      const registerDto: RegisterDto = {
        email: "newuser@example.com",
        password: "password123",
        username: "John",
        image: "http://example.com/files/uploadedImage.jpg",
      };

      const mockCreatedUser = {
        id: "3",
        ...registerDto,
        password: await bcrypt.hash(registerDto.password, 10),
        role: Role.Customer,
        creationDate: new Date(),
        rating: [],
        image: "http://example.com/files/uploadedImage.jpg",
      };

      const mockSend = jest.fn();
      const mockUploadFile = jest
        .spyOn(mockFileUploadService, "uploadFile")
        .mockResolvedValue("uploadedImage.jpg");

      const response: Partial<Response> = {
        cookie: jest.fn(),
        send: mockSend,
      };

      jest.spyOn(mockUserService, "checkUnknownUser").mockResolvedValue(false);
      jest.spyOn(mockUserService, "create").mockResolvedValue(mockCreatedUser);
      jest
        .spyOn(mockAuthService, "login")
        .mockReturnValue({ accessToken: "test-token" });

      const mockFile = {
        originalname: "dummyImage.jpg",
        buffer: Buffer.from([]),
      } as Express.Multer.File;

      // Appelez la méthode register avec le fichier
      await authController.register(
        registerDto,
        response as Response,
        mockFile,
      );

      // Assertions
      expect(mockUserService.checkUnknownUser).toHaveBeenCalledWith(
        registerDto,
      );

      // Utilisez expect.any(String) pour vérifier que la propriété image est une chaîne
      expect(mockUserService.create).toHaveBeenCalledWith(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expect.objectContaining({ image: expect.any(String) }),
      );

      expect(mockUploadFile).toHaveBeenCalledWith(mockFile);
      expect(response.cookie).toHaveBeenCalledWith(
        "access_token",
        "test-token",
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockSend).toHaveBeenCalledWith({ accessToken: "test-token" });
    });

    it("should throw ConflictException for existing user", async () => {
      const registerDto: RegisterDto = {
        email: "existing@example.com",
        password: "password123",
        username: "John Doe",
      };

      jest.spyOn(mockUserService, "checkUnknownUser").mockResolvedValue(true);

      const mockSend = jest.fn();
      const response = {
        cookie: jest.fn(),
        send: mockSend,
      } as unknown as Response;

      await expect(
        authController.register(registerDto, response),
      ).rejects.toThrow(HttpException);
      await expect(
        authController.register(registerDto, response),
      ).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
    });

    it("should throw InternalServerErrorException if user creation fails", async () => {
      const registerDto: RegisterDto = {
        email: "newuser@example.com",
        password: "password123",
        username: "John Doe",
      };

      jest.spyOn(mockUserService, "checkUnknownUser").mockResolvedValue(false);
      jest.spyOn(mockUserService, "create").mockResolvedValue(null);

      const mockSend = jest.fn();
      const response = {
        cookie: jest.fn(),
        send: mockSend,
      } as unknown as Response;

      await expect(
        authController.register(registerDto, response),
      ).rejects.toThrow(HttpException);
      await expect(
        authController.register(registerDto, response),
      ).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("logout", () => {
    it("should successfully logout user and clear cookie", () => {
      const mockClearCookie = jest.fn();
      const mockSend = jest.fn();
      const response: Partial<Response> = {
        clearCookie: mockClearCookie,
        status: jest.fn().mockReturnThis(),
        send: mockSend,
      };

      authController.logout(response as Response);

      expect(mockClearCookie).toHaveBeenCalledWith("access_token");
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockSend).toHaveBeenCalled();
    });
  });
});
