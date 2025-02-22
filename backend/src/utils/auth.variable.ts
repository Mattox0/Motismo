import { hash } from "bcrypt";

function hashPassword(plaintextPassword: string) {
  return hash(plaintextPassword, 10);
}

export default hashPassword;
