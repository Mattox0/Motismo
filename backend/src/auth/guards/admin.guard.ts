import { ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

import { UserAuthGuard } from "@/auth/guards/user-auth.guard";
import { TranslationService } from "@/translation/translation.service";
import { UserService } from "@/user/service/user.service";
import { IRequestWithUser } from "@/user/types/IRequestWithUser";
import { Role } from "@/user/role.enum";

@Injectable()
export class AdminGuard extends UserAuthGuard {
  constructor(
    protected readonly translationsService: TranslationService,
    protected readonly userService: UserService,
  ) {
    super(translationsService, userService);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<IRequestWithUser>();
    const user = request.user;

    if (!user || user.role !== Role.Admin) {
      throw new ForbiddenException(await this.translationsService.translate("error.PERMISSION_DENIED"));
    }

    return true;
  }
}
