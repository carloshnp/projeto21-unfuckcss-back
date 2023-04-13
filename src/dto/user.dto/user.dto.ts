import { User } from "src/schema/user.schema/user.schema";

export class LoginResponse {
  constructor(
    public user: Omit<User, 'password'>,
    public accessToken: string,
  ) {}
}