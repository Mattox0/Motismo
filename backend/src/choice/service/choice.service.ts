import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Choice } from "@/choice/choice.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateChoiceDto } from "@/choice/dto/createChoice.dto";
import { ChoiceQuestion } from "@/question/entity/choiceQuestion.entity";
import { TranslationService } from "@/translation/translation.service";

@Injectable()
export class ChoiceService {
  constructor(
    @InjectRepository(Choice)
    private readonly choiceRepository: Repository<Choice>,
    private readonly translationService: TranslationService,
  ) {}

  async createChoice(choice: CreateChoiceDto, question: ChoiceQuestion): Promise<Choice> {
    const newChoice = this.choiceRepository.create(choice);

    if (!newChoice) {
      throw new BadRequestException(await this.translationService.translate("error.FAILED_TO_CREATE_CHOICE"));
    }

    newChoice.question = question;

    return this.choiceRepository.save(newChoice);
  }

  getChoices(question: ChoiceQuestion): Promise<Choice[]> {
    return this.choiceRepository.find({
      where: { question },
    });
  }

  async updateChoices(question: ChoiceQuestion, choices: CreateChoiceDto[]): Promise<void> {
    await this.choiceRepository.delete({ question: { id: question.id } });

    for (const choice of choices) {
      await this.createChoice(choice, question);
    }
  }

  async getChoice(id: string): Promise<Choice> {
    const choice = await this.choiceRepository.findOne({
      where: { id },
    });

    if (!choice) {
      throw new NotFoundException(await this.translationService.translate("error.CHOICE_NOT_FOUND"));
    }

    return choice;
  }
}
