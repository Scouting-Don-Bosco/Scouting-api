import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";
import { $Enums, UserRole } from "@prisma/client";
import { isEnum, isDefined } from "class-validator";

export class RoleValidationPipe implements PipeTransform<string, UserRole> {
  transform(value: string): UserRole {
    if (isDefined(value) && isEnum(value, UserRole)) {
      return UserRole[value];
    } else {
      const errorMessage = `the value ${value} is not a valid UserRole. See the acceptable values: ${Object.keys(
        UserRole,
      ).map((key) => UserRole[key])}`;
      throw new BadRequestException(errorMessage);
    }
  }
}

export class RoleArrayValidationPipe
  implements PipeTransform<string[], UserRole[]>
{
  transform(value: string[]): UserRole[] {
    if (isDefined(value) && value.every((role) => isEnum(role, UserRole))) {
      return value.map((role) => UserRole[role]);
    } else {
      const errorMessage = `the value ${value} is not a valid UserRole[]. See the acceptable values: ${Object.keys(
        UserRole,
      ).map((key) => UserRole[key])}`;
      throw new BadRequestException(errorMessage);
    }
  }
}
