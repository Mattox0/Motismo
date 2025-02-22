import { Role } from "@/user/role.enum";

export type JwtPayload = {
  id: string;
  email: string;
  username: string;
  role: Role;
};
