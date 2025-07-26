import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import { type IRequestWithUser } from "@/user/types/IRequestWithUser";

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<IRequestWithUser>();

  return request.user;
});
