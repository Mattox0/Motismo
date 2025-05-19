import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { IRequestWithQuestion } from "@/question/types/IRequestWithQuestion";

export const QuestionRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<IRequestWithQuestion>();

    return request.question;
  },
);
