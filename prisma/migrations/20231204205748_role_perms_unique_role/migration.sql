/*
  Warnings:

  - The primary key for the `RolePerms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `RolePerms` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[role]` on the table `RolePerms` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RolePerms" DROP CONSTRAINT "RolePerms_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "RolePerms_role_key" ON "RolePerms"("role");
