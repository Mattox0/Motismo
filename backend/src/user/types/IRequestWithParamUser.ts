import { User } from "@/user/user.entity";

export interface IRequestWithParamUser extends Request {
  params: {
    userId: string;
  };
  user?: User;
}
