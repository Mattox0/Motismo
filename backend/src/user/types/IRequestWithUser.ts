import { User } from "../user.entity";

export interface IRequestWithUser extends Request {
  user?: User;
}
