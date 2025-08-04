import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import { type IRequestWithParamUser } from "@/user/types/IRequestWithParamUser";

export const UserRequest = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<IRequestWithParamUser>();

  return request.user;
});
