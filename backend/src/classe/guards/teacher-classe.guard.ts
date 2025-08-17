import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { TranslationService } from "@/translation/translation.service";
import { Classe } from "@/classe/classe.entity";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";

interface IRequestWithClasseAndUser extends Request {
  classe?: Classe;
  user?: User;
}

@Injectable()
export class TeacherClasseGuard implements CanActivate {
  constructor(private readonly translationsService: TranslationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithClasseAndUser>();
    const classe = request.classe;
    const user = request.user;

    if (!classe || !user) {
      throw new HttpException(await this.translationsService.translate("error.UNAUTHORIZED"), HttpStatus.UNAUTHORIZED);
    }

    if (user.role === Role.Admin) {
      return true;
    }

    const isTeacher = classe.teachers.some((teacher) => teacher.id === user.id);

    if (!isTeacher) {
      throw new HttpException(
        await this.translationsService.translate("error.NOT_TEACHER_OF_CLASSE"),
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
