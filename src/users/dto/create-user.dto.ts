import { UserRole } from "@prisma/client";

export class CreateUserDto {
  email: string;
  password: string;
  username: string;
  roles: UserRole[];
}
