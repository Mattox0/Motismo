import { User } from "@/user/user.entity";

export interface IRequestWithParamUser extends Request {
  params: {
    userId: string;
  };
  user?: User;
}

export interface IRequestWithParamTeacher extends Request {
  params: {
    teacherId: string;
  };
  paramTeacher?: User;
}

export interface IRequestWithParamStudent extends Request {
  params: {
    studentId: string;
  };
  paramStudent?: User;
}
