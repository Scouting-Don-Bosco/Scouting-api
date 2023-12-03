-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW_MEMBERS', 'VIEW_GROUPS', 'EDIT_MEMBERS', 'EDIT_GROUPS', 'VIEW_USERS', 'EDIT_USERS', 'EDIT_NEWS', 'CREATE_NEWS', 'DELETE_NEWS');

-- CreateTable
CREATE TABLE "AcceptedRoutes" (
    "id" TEXT NOT NULL,
    "routePath" TEXT NOT NULL,
    "roles" "UserRole"[],

    CONSTRAINT "AcceptedRoutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePerms" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "perms" "Permission"[],

    CONSTRAINT "RolePerms_pkey" PRIMARY KEY ("id")
);
