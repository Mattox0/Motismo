import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { Quizz } from "@/quizz/quizz.entity";

@Injectable()
export class QuizzService {
  constructor(
    @InjectRepository(Quizz)
    private quizzRepository: Repository<Quizz>,
    private translationService: TranslationService,
  ) {}

  getAll(): Promise<Quizz[]> {
    return this.quizzRepository.find({});
  }
}
