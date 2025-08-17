import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import {
  type IRequestWithParamUser,
  type IRequestWithParamTeacher,
  type IRequestWithParamStudent,
} from "@/user/types/IRequestWithParamUser";

export const UserRequest = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<IRequestWithParamUser>();

  return request.user;
});

export const TeacherRequest = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<IRequestWithParamTeacher>();

  return request.paramTeacher;
});

export const StudentRequest = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<IRequestWithParamStudent>();

  return request.paramStudent;
});
