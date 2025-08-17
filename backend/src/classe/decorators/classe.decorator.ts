import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import { type Classe } from "@/classe/classe.entity";

interface IRequestWithParamClasse extends Request {
  classe?: Classe;
}

export const ClasseRequest = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<IRequestWithParamClasse>();

  return request.classe;
});
