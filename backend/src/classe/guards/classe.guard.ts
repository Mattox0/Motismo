import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { Classe } from "@/classe/classe.entity";
import { uuidRegex } from "@/utils/regex.variable";

interface IRequestWithParamClasse extends Request {
  params: {
    classeId: string;
  };
  classe?: Classe;
}

@Injectable()
export class ClasseGuard implements CanActivate {
  constructor(
    @InjectRepository(Classe)
    private classeRepository: Repository<Classe>,
    private readonly translationsService: TranslationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithParamClasse>();
    const classeId = request.params.classeId;

    if (!uuidRegex.test(classeId)) {
      throw new HttpException(await this.translationsService.translate("error.ID_INVALID"), HttpStatus.BAD_REQUEST);
    }

    const classe = await this.classeRepository.findOne({
      where: {
        id: classeId,
      },
      relations: {
        teachers: true,
        students: true,
      },
    });

    if (!classe) {
      throw new HttpException(await this.translationsService.translate("error.CLASSE_NOT_FOUND"), HttpStatus.NOT_FOUND);
    }

    request.classe = classe;

    return true;
  }
}
