import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { IRequestWithCard } from "@/cards/types/IRequestWithCard";

export const CardRequest = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<IRequestWithCard>();

  return request.card;
});
