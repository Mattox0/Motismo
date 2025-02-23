import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { IRequestWithQuizz } from "@/quizz/types/IRequestWithQuizz";

export const QuizzRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<IRequestWithQuizz>();

    return request.quizz;
  },
);
