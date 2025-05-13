import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFiles,
  Inject,
  HttpException,
  HttpStatus,
  Put,
  Delete,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CardService } from "../service/card.service";
import { QuizzGuard } from "@/quizz/guards/quizz.guard";
import { QuizzRequest } from "@/quizz/decorator/quizz.decorator";
import { Quizz } from "@/quizz/quizz.entity";
import { Card } from "../card.entity";
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { CreateCardDto } from "../dto/createCard.dto";
import { FileUploadService } from "@/files/files.service";
import { ParseFilesPipe } from "@/files/files.validator";
import { TranslationService } from "@/translation/translation.service";
import { UpdateCardDto } from "../dto/updateCard.dto";
import { CardRequest } from "../decorator/card.decorator";
import { CardGuard } from "../guards/card.guard";

@ApiTags("cards")
@ApiParam({ name: "quizzId" })
@ApiBadRequestResponse({ description: "Invalid quizz ID format" })
@ApiNotFoundResponse({ description: "Quizz not found" })
@Controller("quizz/:quizzId/cards")
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly fileUploadService: FileUploadService,
    @Inject(ParseFilesPipe) private readonly parseFilesPipe: ParseFilesPipe,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  @UseGuards(QuizzGuard)
  @ApiOperation({ summary: "Get all cards for a specific quizz" })
  @ApiOkResponse({
    description:
      "Returns all cards for the specified quizz, ordered by their order field",
    type: [Card],
  })
  getCards(@QuizzRequest() quizz: Quizz): Promise<Card[]> {
    return this.cardService.getCards(quizz.id);
  }

  @Get(":cardId")
  @UseGuards(QuizzGuard)
  @UseGuards(CardGuard)
  @ApiParam({ name: "cardId" })
  @ApiOperation({ summary: "Get a specific card by ID" })
  @ApiOkResponse({ description: "Returns the specified card" })
  @ApiNotFoundResponse({ description: "Card not found" })
  getCard(@CardRequest() card: Card): Card {
    return card;
  }

  @Post()
  @UseGuards(QuizzGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "rectoImage", maxCount: 1 },
      { name: "versoImage", maxCount: 1 },
    ]),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateCardDto })
  async createCard(
    @QuizzRequest() quizz: Quizz,
    @Body() createCardDto: CreateCardDto,
    @UploadedFiles()
    files?: {
      rectoImage?: Express.Multer.File[];
      versoImage?: Express.Multer.File[];
    },
  ): Promise<void> {
    if (files) {
      const validatedFiles = await this.parseFilesPipe.transform(files);

      if (!validatedFiles || "originalname" in validatedFiles) {
        throw new HttpException(
          await this.translationService.translate("error.INVALID_FILE"),
          HttpStatus.BAD_REQUEST,
        );
      }

      if (validatedFiles.rectoImage?.[0]) {
        const key = await this.fileUploadService.uploadFile(
          validatedFiles.rectoImage[0],
        );

        createCardDto.rectoImage = this.fileUploadService.getFileUrl(key);
      }

      if (validatedFiles.versoImage?.[0]) {
        const key = await this.fileUploadService.uploadFile(
          validatedFiles.versoImage[0],
        );

        createCardDto.versoImage = this.fileUploadService.getFileUrl(key);
      }
    }

    await this.cardService.createCard(quizz, createCardDto);
  }

  @Put(":cardId")
  @UseGuards(QuizzGuard)
  @UseGuards(CardGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "rectoImage", maxCount: 1 },
      { name: "versoImage", maxCount: 1 },
    ]),
  )
  async updateCard(
    @QuizzRequest() quizz: Quizz,
    @CardRequest() card: Card,
    @Body() updateCardDto: UpdateCardDto,
    @UploadedFiles()
    files?: {
      rectoImage?: Express.Multer.File[];
      versoImage?: Express.Multer.File[];
    },
  ): Promise<void> {
    if (files) {
      const validatedFiles = await this.parseFilesPipe.transform(files);

      if (!validatedFiles || "originalname" in validatedFiles) {
        throw new HttpException(
          await this.translationService.translate("error.INVALID_FILE"),
          HttpStatus.BAD_REQUEST,
        );
      }

      if (validatedFiles.rectoImage?.[0]) {
        const key = await this.fileUploadService.uploadFile(
          validatedFiles.rectoImage[0],
        );

        updateCardDto.rectoImage = this.fileUploadService.getFileUrl(key);
      }

      if (validatedFiles.versoImage?.[0]) {
        const key = await this.fileUploadService.uploadFile(
          validatedFiles.versoImage[0],
        );

        updateCardDto.versoImage = this.fileUploadService.getFileUrl(key);
      }
    }

    await this.cardService.updateCard(quizz, card, updateCardDto);
  }

  @Delete(":cardId")
  @UseGuards(QuizzGuard)
  @UseGuards(CardGuard)
  @ApiParam({ name: "cardId" })
  @ApiOperation({ summary: "Delete a specific card by ID" })
  @ApiOkResponse({ description: "Returns the specified card" })
  @ApiNotFoundResponse({ description: "Card not found" })
  deleteCard(
    @QuizzRequest() quizz: Quizz,
    @CardRequest() card: Card,
  ): Promise<void> {
    return this.cardService.delete(quizz, card);
  }
}
