import { AuthExceptionFilter } from "@/auth/exception-filter/auth.exception-filter";
import { TranslationService } from "@/translation/translation.service";
import { ArgumentsHost, UnauthorizedException } from "@nestjs/common";
import { Response } from "express";

describe("AuthExceptionFilter", () => {
  let authExceptionFilter: AuthExceptionFilter;
  let translationService: TranslationService;

  beforeEach(() => {
    translationService = {
      translate: jest.fn().mockResolvedValue("You are not authorized."),
    } as unknown as TranslationService;

    authExceptionFilter = new AuthExceptionFilter(translationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllTimers();
  });

  it("should catch UnauthorizedException and return a response", async () => {
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockArgumentsHost: Partial<ArgumentsHost> = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    };

    const exception = new UnauthorizedException();

    await authExceptionFilter.catch(
      exception,
      mockArgumentsHost as ArgumentsHost,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 401,
      message: "You are not authorized.",
    });
  });
});
