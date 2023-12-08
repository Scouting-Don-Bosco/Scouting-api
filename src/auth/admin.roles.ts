import { UserRole } from "@prisma/client";

export function userHasAdminRoles(roles: UserRole[]) {
  for (const role of roles) {
    if (adminRoles.includes(role)) return true;
  }
  return false;
}

export const adminRoles: UserRole[] = [
  UserRole.WEBMASTER,
  UserRole.VOORZITTER,
  UserRole.SECRETARIS,
  UserRole.PENNINGMEESTER,
  UserRole.GROEPSBEGELEIDER,
  UserRole.PRAKTIJKBEGELEIDER,
];
