import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { Quizz } from "@/quizz/quizz.entity";
import { CreateQuizzDto } from "@/quizz/dto/createQuizzDto";
import { UserService } from "@/user/service/user.service";
import { UpdatedQuizzDto } from "@/quizz/dto/updatedQuizzDto";
import { FileUploadService } from "@/files/files.service";

@Injectable()
export class QuizzService {
  constructor(
    @InjectRepository(Quizz)
    private quizzRepository: Repository<Quizz>,
    private userService: UserService,
    private translationService: TranslationService,
    private fileUploadService: FileUploadService,
  ) {}

  getAll(): Promise<Quizz[]> {
    return this.quizzRepository.find({
      relations: {
        author: true,
      },
    });
  }

  async create(createQuizzDto: CreateQuizzDto, userId: string): Promise<void> {
    const user = await this.userService.findOneUser(userId);

    if (!user) {
      throw new HttpException(
        await this.translationService.translate("error.USER_NOT_FOUND"),
        HttpStatus.NOT_FOUND,
      );
    }

    const quizz = this.quizzRepository.create({
      ...createQuizzDto,
      author: user,
    });

    await this.quizzRepository.save(quizz);
  }

  async update(quizzId: string, quizz: UpdatedQuizzDto): Promise<void> {
    const query = await this.quizzRepository
      .createQueryBuilder()
      .update(Quizz)
      .set(quizz)
      .where("id = :id", { id: quizzId })
      .execute();

    if (query.affected === 0) {
      throw new HttpException(
        await this.translationService.translate("error.QUIZZ_NOT_FOUND"),
        HttpStatus.NOT_FOUND,
      );
    }

    return;
  }

  async delete(quizzId: string): Promise<void> {
    const query = await this.quizzRepository
      .createQueryBuilder()
      .delete()
      .from(Quizz)
      .where("id = :id", { id: quizzId })
      .execute();

    if (query.affected === 0) {
      throw new HttpException(
        await this.translationService.translate("error.QUIZZ_NOT_FOUND"),
        HttpStatus.NOT_FOUND,
      );
    }

    return;
  }

  private async deleteUnusedImages(
    quizz: Quizz,
    updateQuizzDto: UpdatedQuizzDto,
  ): Promise<void> {
    if (
      updateQuizzDto.image &&
      quizz.image &&
      updateQuizzDto.image !== quizz.image
    ) {
      await this.fileUploadService.deleteFile(quizz.image);
    }
  }

  async updateQuizz(
    id: string,
    updateQuizzDto: UpdatedQuizzDto,
  ): Promise<void> {
    const quizz = await this.quizzRepository.findOne({
      where: { id },
    });

    if (!quizz) {
      throw new NotFoundException(
        await this.translationService.translate("error.QUIZZ_NOT_FOUND"),
      );
    }

    await this.deleteUnusedImages(quizz, updateQuizzDto);

    const query = await this.quizzRepository
      .createQueryBuilder()
      .update(Quizz)
      .set(updateQuizzDto)
      .where("id = :id", { id })
      .execute();

    if (query.affected === 0) {
      throw new HttpException(
        await this.translationService.translate("error.QUIZZ_NOT_FOUND"),
        HttpStatus.NOT_FOUND,
      );
    }

    return;
  }

  async deleteQuizz(id: string): Promise<void> {
    const quizz = await this.quizzRepository.findOne({
      where: { id },
    });

    if (!quizz) {
      throw new NotFoundException(
        await this.translationService.translate("error.QUIZZ_NOT_FOUND"),
      );
    }

    if (quizz.image) {
      await this.fileUploadService.deleteFile(quizz.image);
    }

    await this.quizzRepository.delete(id);
  }
}
