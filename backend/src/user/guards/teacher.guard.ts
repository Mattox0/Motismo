import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";
import { uuidRegex } from "@/utils/regex.variable";
import { IRequestWithParamTeacher } from "@/user/types/IRequestWithParamUser";

@Injectable()
export class TeacherGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly translationsService: TranslationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithParamTeacher>();
    const teacherId = request.params.teacherId;

    if (!uuidRegex.test(teacherId)) {
      throw new HttpException(await this.translationsService.translate("error.ID_INVALID"), HttpStatus.BAD_REQUEST);
    }

    const teacher = await this.userRepository.findOne({
      where: {
        id: teacherId,
        role: Role.Teacher,
      },
    });

    if (!teacher) {
      throw new HttpException(
        await this.translationsService.translate("error.TEACHER_NOT_FOUND"),
        HttpStatus.NOT_FOUND,
      );
    }

    request.paramTeacher = teacher;

    return true;
  }
}
