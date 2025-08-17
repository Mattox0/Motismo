import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TranslationService } from "@/translation/translation.service";
import { User } from "@/user/user.entity";
import { Role } from "@/user/role.enum";
import { uuidRegex } from "@/utils/regex.variable";
import { IRequestWithParamStudent } from "@/user/types/IRequestWithParamUser";

@Injectable()
export class StudentGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly translationsService: TranslationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithParamStudent>();
    const studentId = request.params.studentId;

    if (!uuidRegex.test(studentId)) {
      throw new HttpException(await this.translationsService.translate("error.ID_INVALID"), HttpStatus.BAD_REQUEST);
    }

    const student = await this.userRepository.findOne({
      where: {
        id: studentId,
        role: Role.Student,
      },
    });

    if (!student) {
      throw new HttpException(
        await this.translationsService.translate("error.STUDENT_NOT_FOUND"),
        HttpStatus.NOT_FOUND,
      );
    }

    request.paramStudent = student;

    return true;
  }
}
