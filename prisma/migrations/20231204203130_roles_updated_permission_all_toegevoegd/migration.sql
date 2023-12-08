/*
  Warnings:

  - The values [USER,BOARDMEMBER,LEADER,SOCIALMANAGER,DATAMANAGER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "Permission" ADD VALUE 'ALL';

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('GEBRUIKER', 'WEBMASTER', 'GEGEVENSBEHEERDER', 'SOCIALMEDIA', 'VOORZITTER', 'SECRETARIS', 'PENNINGMEESTER', 'GROEPSBEGELEIDER', 'PRAKTIJKBEGELEIDER', 'STAFLID', 'TEAMLEIDER');
ALTER TABLE "User" ALTER COLUMN "roles" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "roles" TYPE "UserRole_new"[] USING ("roles"::text::"UserRole_new"[]);
ALTER TABLE "AcceptedRoutes" ALTER COLUMN "roles" TYPE "UserRole_new"[] USING ("roles"::text::"UserRole_new"[]);
ALTER TABLE "RolePerms" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "roles" SET DEFAULT ARRAY['GEBRUIKER']::"UserRole"[];
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "roles" SET DEFAULT ARRAY['GEBRUIKER']::"UserRole"[];
