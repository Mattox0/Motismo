import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { Question } from "@/question/question.entity";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private translationService: TranslationService,
  ) {}
}
