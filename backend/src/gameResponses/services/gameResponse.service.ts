import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TranslationService } from "@/translation/translation.service";
import { GameResponse } from "../gameResponse.entity";

@Injectable()
export class GameResponseService {
  constructor(
    @InjectRepository(GameResponse)
    private gameResponseRepository: Repository<GameResponse>,
    private translationService: TranslationService,
  ) {}

  
}
