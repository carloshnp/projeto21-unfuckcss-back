import { User } from "src/user.schema/user.schema";

export class LoginResponse {
  constructor(
    public user: Omit<User, 'password'>,
    public accessToken: string,
  ) {}
}