import { Reflector } from "@nestjs/core";
import { Permission } from "@prisma/client";

export const Permissions = Reflector.createDecorator<Permission[]>();
