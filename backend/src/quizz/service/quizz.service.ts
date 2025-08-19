import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { Quizz } from "@/quizz/quizz.entity";
import { CreateQuizzDto } from "@/quizz/dto/createQuizzDto";
import { UserService } from "@/user/service/user.service";
import { UpdatedQuizzDto } from "@/quizz/dto/updatedQuizzDto";
import { FileUploadService } from "@/files/files.service";
import { User } from "@/user/user.entity";
import { ClasseService } from "@/classe/service/classe.service";
import { IQuizzType } from "@/quizz/types/IQuizzType";

@Injectable()
export class QuizzService {
  constructor(
    @InjectRepository(Quizz)
    private quizzRepository: Repository<Quizz>,
    private userService: UserService,
    private translationService: TranslationService,
    private fileUploadService: FileUploadService,
    private classeService: ClasseService,
  ) {}

  getAll(): Promise<Quizz[]> {
    return this.quizzRepository.find({
      relations: {
        author: true,
        classes: true,
      },
    });
  }

  async getMyQuizz(user: User) {
    return await this.quizzRepository.find({
      where: { author: { id: user.id } },
      relations: { cards: true, questions: true, classes: true },
    });
  }

  async getStudentQuizz(user: User) {
    return await this.quizzRepository.find({
      where: {
        quizzType: IQuizzType.CARDS,
        classes: {
          students: { id: user.id },
        },
      },
      relations: { cards: true, questions: true, classes: true, author: true },
    });
  }

  async getByCode(code: string) {
    return await this.quizzRepository.findOne({
      where: { games: { code: code } },
      relations: { cards: true, questions: true, games: true, author: true, classes: true },
    });
  }

  async create(createQuizzDto: CreateQuizzDto, userId: string): Promise<Quizz> {
    const user = await this.userService.findOneUser(userId);

    if (!user) {
      throw new HttpException(await this.translationService.translate("error.USER_NOT_FOUND"), HttpStatus.NOT_FOUND);
    }

    const quizz = this.quizzRepository.create({
      ...createQuizzDto,
      author: user,
    });

    if (createQuizzDto.classIds) {
      try {
        const classIdsArray = JSON.parse(createQuizzDto.classIds);

        if (Array.isArray(classIdsArray) && classIdsArray.length > 0) {
          const classes = await this.classeService.validateClassesOwnership(classIdsArray as string[], userId);

          quizz.classes = classes;
        }
      } catch (error) {
        console.warn("Failed to parse classIds:", error);
      }
    }

    return this.quizzRepository.save(quizz);
  }

  private async deleteUnusedImages(quizz: Quizz, updateQuizzDto: UpdatedQuizzDto): Promise<void> {
    if (updateQuizzDto.image && quizz.image && updateQuizzDto.image !== quizz.image) {
      await this.fileUploadService.deleteFile(quizz.image);
    }
  }

  async update(quizz: Quizz, updateQuizzDto: UpdatedQuizzDto): Promise<void> {
    await this.deleteUnusedImages(quizz, updateQuizzDto);

    const updateData: any = Object.assign({}, updateQuizzDto);

    if (updateQuizzDto.classIds !== undefined) {
      try {
        const classIdsArray = JSON.parse(updateQuizzDto.classIds);

        if (Array.isArray(classIdsArray) && classIdsArray.length > 0) {
          const classes = await this.classeService.validateClassesOwnership(classIdsArray as string[], quizz.author.id);

          updateData.classes = classes;
        } else {
          updateData.classes = [];
        }
      } catch (error) {
        updateData.classes = [];
        console.warn("Failed to parse classIds in update:", error);
      }
    }

    Object.assign(quizz, updateData);

    await this.quizzRepository.save(quizz);

    return;
  }

  async delete(id: string): Promise<void> {
    const quizz = await this.quizzRepository.findOne({
      where: { id },
    });

    if (!quizz) {
      throw new NotFoundException(await this.translationService.translate("error.QUIZZ_NOT_FOUND"));
    }

    if (quizz.image) {
      await this.fileUploadService.deleteFile(quizz.image);
    }

    await this.quizzRepository.delete(id);
  }

  async findOne(id: string): Promise<Quizz> {
    const quizz = await this.quizzRepository.findOne({
      where: { id },
      relations: {
        author: true,
        questions: true,
        classes: true,
        cards: true,
        games: true,
      },
    });

    if (!quizz) {
      throw new NotFoundException(await this.translationService.translate("error.QUIZZ_NOT_FOUND"));
    }

    return quizz;
  }
}
