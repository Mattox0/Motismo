import { IUserRole } from '../IUserRole';

export interface IUser {
  id: string;
  username: string;
  email: string;
  creationDate: Date;
  role: IUserRole;
}
