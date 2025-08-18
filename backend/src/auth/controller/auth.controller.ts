import { Body, Controller, HttpException, HttpStatus, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { hash, compare } from "bcrypt";
import { Express, Response } from "express";

import { LoginDto } from "@/auth/dto/login.dto";
import { LoginResponse } from "@/auth/dto/loginResponse";
import { RegisterDto } from "@/auth/dto/register.dto";
import { AuthService } from "@/auth/service/auth.service";
import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { UserService } from "@/user/service/user.service";
import { ParseFilesPipe } from "@/files/files.validator";
import { ClasseService } from "@/classe/service/classe.service";
import { Role } from "@/user/role.enum";

const expirationTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly translationService: TranslationService,
    private readonly fileUploadService: FileUploadService,
    private readonly classeService: ClasseService,
  ) {}

  @Post("/login")
  @ApiOperation({ summary: "Login user" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiOkResponse({ type: LoginResponse })
  async login(@Body() body: LoginDto, @Res() response: Response): Promise<object> {
    const user = await this.userService.findOneEmail(body.email);

    if (!user) {
      throw new HttpException(
        await this.translationService.translate("error.INVALID_CREDENTIALS"),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!(await comparePassword(body.password, user.password))) {
      throw new HttpException(
        await this.translationService.translate("error.INVALID_CREDENTIALS"),
        HttpStatus.BAD_REQUEST,
      );
    }
    const { accessToken } = this.authService.login(user);

    response.cookie("access_token", accessToken, {
      expires: expirationTime,
      httpOnly: true,
    });

    return response.send({
      accessToken,
      id: user.id,
    });
  }

  @Post("/register")
  @UseInterceptors(FileInterceptor("image"))
  @ApiOperation({ summary: "Register a new user" })
  @ApiInternalServerErrorResponse({
    description: "An unexpected error occurred while creating the user",
  })
  @ApiConflictResponse({
    description: "A user with the given email or username already exists",
  })
  @ApiCreatedResponse({
    description: "The user was successfully registered and an access token has been returned",
    type: LoginResponse,
  })
  async register(
    @Body() body: RegisterDto,
    @Res() response: Response,
    @UploadedFile(ParseFilesPipe) file?: Express.Multer.File,
  ): Promise<object> {
    if (await this.userService.checkUnknownUser(body)) {
      throw new HttpException(await this.translationService.translate("error.USER_EXIST"), HttpStatus.CONFLICT);
    }

    const userBody = Object.assign({}, body);

    userBody.password = await hashPassword(userBody.password);

    if (file) {
      const fileName = await this.fileUploadService.uploadFile(file);

      userBody.image = this.fileUploadService.getFileUrl(fileName);
    }

    const user = await this.userService.create(userBody);

    if (!user) {
      throw new HttpException(
        await this.translationService.translate("error.USER_CANT_CREATE"),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (user.role === Role.Student && body.classCode) {
      try {
        await this.classeService.joinByCode(body.classCode, user);
      } catch (error) {
        console.error("Error joining class during registration:", error);
      }
    }

    const { accessToken } = this.authService.login(user);

    response.cookie("access_token", accessToken, {
      expires: expirationTime,
      httpOnly: true,
    });

    return response.send({
      accessToken,
      id: user.id,
    });
  }

  @Post("/logout")
  @ApiOperation({ summary: "Logout user" })
  @ApiOkResponse({ description: "User has been successfully logged out" })
  logout(@Res() response: Response) {
    response.clearCookie("access_token");
    response.status(HttpStatus.OK).send();
  }
}

function hashPassword(plaintextPassword: string) {
  return hash(plaintextPassword, 10);
}

function comparePassword(plaintextPassword: string, hash: string) {
  return compare(plaintextPassword, hash);
}
