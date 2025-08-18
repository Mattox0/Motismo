import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { TranslationService } from "@/translation/translation.service";
import { Role } from "@/user/role.enum";
import { IRequestWithUser } from "@/user/types/IRequestWithUser";

@Injectable()
export class StudentAuthGuard implements CanActivate {
  constructor(private readonly translationsService: TranslationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new HttpException(await this.translationsService.translate("error.UNAUTHORIZED"), HttpStatus.UNAUTHORIZED);
    }

    if (user.role !== Role.Student) {
      throw new HttpException(
        await this.translationsService.translate("error.ONLY_STUDENTS_CAN_JOIN_CLASSES"),
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
