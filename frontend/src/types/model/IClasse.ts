import { IUser } from './IUser';

export interface IClasse {
  id: string;
  name: string;
  code: string;
  students: IUser[];
  teachers: IUser[];
}







