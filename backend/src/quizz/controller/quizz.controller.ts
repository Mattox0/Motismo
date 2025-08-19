import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { FileUploadService } from "@/files/files.service";
import { TranslationService } from "@/translation/translation.service";
import { Quizz } from "@/quizz/quizz.entity";
import { QuizzService } from "@/quizz/service/quizz.service";
import { CurrentUser } from "@/user/decorators/currentUser.decorator";
import { User } from "@/user/user.entity";
import { CreateQuizzDto } from "@/quizz/dto/createQuizzDto";
import { FileInterceptor } from "@nestjs/platform-express";
import { QuizzRequest } from "@/quizz/decorator/quizz.decorator";
import { QuizzGuard } from "@/quizz/guards/quizz.guard";
import { UpdatedQuizzDto } from "@/quizz/dto/updatedQuizzDto";
import { ParseFilesPipe } from "@/files/files.validator";
import { Role } from "@/user/role.enum";

@ApiTags("quizz")
@ApiUnauthorizedResponse({ description: "User not connected" })
@Controller("quizz")
export class QuizzController {
  constructor(
    private quizzService: QuizzService,
    private readonly translationService: TranslationService,
    private readonly fileUploadService: FileUploadService,
    @Inject(ParseFilesPipe) private readonly parseFilesPipe: ParseFilesPipe,
  ) {}

  @Get("")
  @UseGuards(UserAuthGuard)
  @ApiOperation({ summary: "Returns all user quizzies" })
  @ApiOkResponse({
    description: "Quizzies found successfully",
    type: Quizz,
    isArray: true,
  })
  getAll(@CurrentUser() myUser: User): Promise<Quizz[]> {
    if (myUser.role === Role.Teacher || myUser.role === Role.Admin) {
      return this.quizzService.getMyQuizz(myUser);
    }

    return this.quizzService.getStudentQuizz(myUser);
  }

  @Get("/code/:code")
  @ApiOperation({ summary: "Returns a quizz by id" })
  @ApiOkResponse({ description: "Quizz found successfully" })
  @ApiBadRequestResponse({ description: "Invalid id" })
  async getByCode(@Param("code") code: string): Promise<Quizz> {
    const quizz = await this.quizzService.getByCode(code);

    if (!quizz) {
      throw new HttpException(await this.translationService.translate("error.QUIZZ_NOT_FOUND"), HttpStatus.NOT_FOUND);
    }

    return quizz;
  }

  @Get("/:quizzId")
  @UseGuards(QuizzGuard)
  @ApiOperation({ summary: "Returns a quizz by id" })
  @ApiOkResponse({ description: "Quizz found successfully" })
  @ApiBadRequestResponse({ description: "Invalid id" })
  getById(@QuizzRequest() quizz: Quizz): Quizz {
    return quizz;
  }

  @Post("")
  @UseGuards(UserAuthGuard)
  @UseInterceptors(FileInterceptor("image"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Create a new quizz" })
  @ApiOkResponse({ description: "Quizz created successfully", type: Quizz })
  @ApiBadRequestResponse({ description: "Invalid data" })
  async create(
    @CurrentUser() user: User,
    @Body() body: CreateQuizzDto,
    @UploadedFile(ParseFilesPipe) file?: Express.Multer.File,
  ): Promise<Quizz> {
    const quizzData = Object.assign({}, body);

    if (file) {
      const fileName = await this.fileUploadService.uploadFile(file);

      quizzData.image = this.fileUploadService.getFileUrl(fileName);
    }

    return this.quizzService.create(quizzData, user.id);
  }

  @Put("/:quizzId")
  @UseGuards(QuizzGuard, UserAuthGuard)
  @UseInterceptors(FileInterceptor("image"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Update a quizz by id" })
  @ApiOkResponse({ description: "Quizz updated successfully" })
  @ApiBadRequestResponse({ description: "Invalid id" })
  async update(
    @CurrentUser() user: User,
    @QuizzRequest() quizz: Quizz,
    @Body() body: UpdatedQuizzDto,
    @UploadedFile(ParseFilesPipe) file?: Express.Multer.File,
  ): Promise<void> {
    if (user.id !== quizz.author.id) {
      throw new HttpException(
        await this.translationService.translate("error.USER_NOT_AUTHOR"),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (file) {
      const fileName = await this.fileUploadService.uploadFile(file);

      body.image = this.fileUploadService.getFileUrl(fileName);
    }

    await this.quizzService.update(quizz, body);
  }

  @Delete("/:quizzId")
  @UseGuards(QuizzGuard, UserAuthGuard)
  @ApiOperation({ summary: "Delete a quizz by id" })
  @ApiOkResponse({ description: "Quizz deleted successfully" })
  @ApiBadRequestResponse({ description: "Invalid id" })
  async delete(@QuizzRequest() quizz: Quizz): Promise<void> {
    await this.quizzService.delete(quizz.id);
  }
}
